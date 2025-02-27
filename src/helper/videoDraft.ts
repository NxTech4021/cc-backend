/* eslint-disable promise/always-return */

import workerpool from 'workerpool';
import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import fs from 'fs';
import { uploadPitchVideo, uploadImage } from '@configs/cloudStorage.config';
import amqplib from 'amqplib';
import { activeProcesses, clients, io } from '../server';
import { Entity, PrismaClient, Submission } from '@prisma/client';
import { saveNotification } from '@controllers/notificationController';
import { spawn } from 'child_process';
import path from 'path';

import dayjs from 'dayjs';
import { notificationDraft } from './notification';
import { createNewTask, getTaskId, updateTask } from '@services/kanbanService';
import { createNewRowData } from '@services/google_sheets/sheets';

Ffmpeg.setFfmpegPath(ffmpegPath.path);
Ffmpeg.setFfprobePath(ffprobePath.path);

const prisma = new PrismaClient();
const pool = workerpool.pool();

interface VideoFile {
  inputPath: string;
  outputPath: string;
  fileName: string;
}

const processVideo = async (
  content: any,
  inputPath: string,
  outputPath: string,
  submissionId: string,
  fileName: string,
  folder: string,
  caption: string,
) => {
  return new Promise<void>((resolve, reject) => {
    const { userid } = content;
    // const { userid, inputPath, outputPath, submissionId, fileName, folder, caption } = videoData;
    const command = Ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 26',
        '-pix_fmt yuv420p',
        '-preset ultrafast',
        '-map 0:v:0',
        '-map 0:v:0',
        '-map 0:a:0?',
        '-threads 4',
      ])
      .save(outputPath)
      .on('progress', (progress) => {
        activeProcesses.set(submissionId, command);
        const percentage = Math.round(progress.percent as number);
        if (io) {
          io.to(clients.get(userid)).emit('progress', {
            progress: percentage,
            submissionId: submissionId,
            name: 'Compression Start',
            fileName: fileName,
            fileSize: fs.statSync(inputPath).size,
            fileType: path.extname(fileName),
          });
        }
      })
      .on('end', async () => {
        if (io) {
          io.to(clients.get(userid)).emit('progress', {
            progress: 100,
            submissionId: submissionId,
            name: 'Compression Start',
            fileName: fileName,
            fileSize: fs.statSync(inputPath).size,
            fileType: path.extname(fileName),
          });
        }

        if (fs.existsSync(inputPath)) {
          fs.unlinkSync(inputPath);
        } else {
          console.warn(`File not found: ${inputPath}`);
        }

        resolve();
      })
      .on('error', (err) => {
        console.error('Error processing video:', err);
        activeProcesses.delete(submissionId);
        reject(err);
        fs.unlinkSync(inputPath);
      });
  });
};

// const checkCurrentSubmission = async (submission: any) => {
//   if (submission) {
//     const { video, rawFootages, photos, campaign, submissionType } = submission;
//     const submissionTypeName = submissionType?.type;

// let allDeliverablesSent = false;

// if (submissionTypeName === 'FIRST_DRAFT') {
//   // Check if all deliverables are submitted
//   const hasVideo = video.length > 0;
//   const hasRawFootage = campaign.rawFootage ? rawFootages.length > 0 : true;
//   const hasPhotos = campaign.photos ? photos.length > 0 : true;

//   allDeliverablesSent = hasVideo && hasRawFootage && hasPhotos;
// } else if (submissionTypeName === 'FINAL_DRAFT') {
//   // For final draft, only video submission is needed
//   allDeliverablesSent = video.length > 0;
// }

// // Update submission status based on deliverable checks
// if (allDeliverablesSent) {
//   await prisma.submission.update({
//     where: { id: submission.id },
//     data: {
//       status: 'PENDING_REVIEW',
//       submissionDate: dayjs().format(),
//     },
//   });
// } else {
//   await prisma.submission.update({
//     where: { id: submission.id },
//     data: {
//       status: 'IN_PROGRESS',
//     },
//   });
// }

// if (io) {
//   io.to(clients.get(submission.userId)).emit('updateSubmission');
// }
//   }
// };

const checkCurrentSubmission = async (submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { submissionType: true, campaign: true },
  });

  if (!submission) throw new Error('Submission not found');

  const [videos, rawFootages, photos] = await Promise.all([
    prisma.video.count({ where: { submissionId } }),
    prisma.rawFootage.count({ where: { submissionId } }),
    prisma.photo.count({ where: { submissionId } }),
  ]);

  let allDeliverablesSent = false;

  if (submission?.submissionType.type === 'FIRST_DRAFT') {
    // Check if all deliverables are submitted
    const hasVideo = videos > 0;
    const hasRawFootage = submission.campaign.rawFootage ? rawFootages > 0 : true;
    const hasPhotos = submission.campaign.photos ? photos > 0 : true;

    allDeliverablesSent = hasVideo && hasRawFootage && hasPhotos;
  } else if (submission?.submissionType.type === 'FINAL_DRAFT') {
    // For final draft, only video submission is needed
    allDeliverablesSent = videos > 0;
  }

  // Update submission status based on deliverable checks
  if (allDeliverablesSent) {
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'PENDING_REVIEW',
        submissionDate: dayjs().format(),
      },
    });
  } else {
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'IN_PROGRESS',
      },
    });
  }

  if (io) {
    io.to(clients.get(submission.userId)).emit('updateSubmission');
  }
};

(async () => {
  try {
    const conn = await amqplib.connect(process.env.RABBIT_MQ!);
    const channel = await conn.createChannel();
    await channel.assertQueue('draft', { durable: true });
    await channel.purgeQueue('draft');
    console.log('Consumer 1 Starting...');
    const startUsage = process.cpuUsage();

    await channel.consume('draft', async (msg) => {
      if (msg !== null) {
        const content: any = JSON.parse(msg.content.toString());
        const { filePaths } = content;

        try {
          const submission = await prisma.submission.findUnique({
            where: { id: content.submissionId },
            select: {
              id: true,
              video: true,
              rawFootages: true,
              photos: true,
              submissionType: true,
              userId: true,
              campaign: {
                select: {
                  rawFootage: true,
                  photos: true,
                },
              },
            },
          });

          if (!submission) throw new Error('Submission not found');

          // For videos
          if (filePaths?.video?.length) {
            const videoPromises = filePaths.video.map(async (videoFile: VideoFile, index: any) => {
              console.log(`Processing video ${videoFile.fileName}`);

              // Process video
              await processVideo(
                content,
                videoFile.inputPath,
                videoFile.outputPath,
                submission.id,
                videoFile.fileName,
                content.folder,
                content.caption,
              );

              const { size } = await fs.promises.stat(videoFile.outputPath);

              // // Upload processed video
              const videoPublicURL = await uploadPitchVideo(
                videoFile.outputPath,
                videoFile.fileName,
                content.folder,
                (data: number) => {
                  io?.to(clients.get(content.userid)!).emit('progress', {
                    // progress: data,
                    // submissionId: submission.id,
                    // name: 'Uploading Start',
                    progress: Math.ceil(data),
                    submissionId: submission.id,
                    name: 'Uploading Start',
                    fileName: videoFile.fileName,
                    fileSize: fs.statSync(videoFile.outputPath).size,
                    fileType: path.extname(videoFile.fileName),
                  });
                },
                size,
              );

              await fs.promises.unlink(videoFile.outputPath);

              // Save to database
              await prisma.video.create({
                data: {
                  url: videoPublicURL,
                  submissionId: submission.id,
                },
              });
            });

            // Wait for all videos to be processed
            await Promise.all(videoPromises);

            const data = await prisma.submission.update({
              where: {
                id: submission.id,
              },
              data: {
                caption: content.caption,
                submissionDate: dayjs().format(),
              },
              include: {
                submissionType: true,
                campaign: {
                  include: {
                    campaignAdmin: {
                      select: {
                        adminId: true,
                        admin: {
                          select: {
                            user: {
                              select: {
                                Board: {
                                  include: {
                                    columns: true,
                                  },
                                },
                                id: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
                user: { include: { creator: true } },
              },
            });

            if (data.campaign.spreadSheetURL) {
              const spreadSheetId = data.campaign.spreadSheetURL.split('/d/')[1].split('/')[0];
              await createNewRowData({
                creatorInfo: {
                  name: data.user.name as string,
                  username: data.user.creator?.instagram as string,
                  postingDate: dayjs().format('LL'),
                  caption: content.caption,
                  videoLink: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${data?.submissionType.type}/${
                    data?.id
                  }_draft.mp4?v=${dayjs().toISOString()}`,
                },
                spreadSheetId,
              });
            }

            const { title, message } = notificationDraft(data.campaign.name, 'Creator');

            const notification = await saveNotification({
              userId: data.userId,
              message: message,
              title: title,
              entity: 'Draft',
              entityId: data.campaign.id,
            });

            io?.to(clients.get(data.userId)).emit('notification', notification);

            const { title: adminTitle, message: adminMessage } = notificationDraft(
              data.campaign.name,
              'Admin',
              data.user.name as string,
            );

            for (const item of data.campaign.campaignAdmin) {
              const notification = await saveNotification({
                userId: item.adminId,
                message: adminMessage,
                creatorId: content.userId,
                title: adminTitle,
                entity: 'Draft',
                entityId: data.campaignId,
              });

              if (item.admin.user.Board) {
                const actionNeededColumn = item.admin.user.Board.columns.find((item) => item.name === 'Actions Needed');

                const taskInDone = await getTaskId({
                  boardId: item.admin.user.Board.id,
                  submissionId: data.id,
                  columnName: 'Done',
                });

                if (actionNeededColumn) {
                  if (taskInDone) {
                    await updateTask({
                      taskId: taskInDone.id,
                      toColumnId: actionNeededColumn.id,
                      userId: item.admin.user.id,
                    });
                  } else {
                    await createNewTask({
                      submissionId: data.id,
                      name: 'Draft Submission',
                      userId: item.admin.user.id,
                      position: 1,
                      columnId: actionNeededColumn.id,
                    });
                  }
                }
              }

              if (io) {
                io.to(clients.get(item.adminId)).emit('notification', notification);
              }
            }

            activeProcesses.delete(submission.id);
          }

          //For Raw Footages
          if (filePaths?.rawFootages?.length) {
            await Promise.all(
              filePaths.rawFootages.map(async (rawFootagePath: any) => {
                const rawFootageFileName = `${submission.id}_${path.basename(rawFootagePath)}`;
                const rawFootagePublicURL = await uploadPitchVideo(rawFootagePath, rawFootageFileName, content.folder);
                await prisma.rawFootage.create({
                  data: { url: rawFootagePublicURL, submissionId: submission.id, campaignId: content.campaignId },
                });
              }),
            );

            // for (const rawFootagePath of filePaths.rawFootages) {
            //   const rawFootageFileName = `${submission.id}_${path.basename(rawFootagePath)}`;
            //   const rawFootagePublicURL = await uploadPitchVideo(rawFootagePath, rawFootageFileName, content.folder);

            //   console.log('✅ Raw footage uploaded successfully:', rawFootagePublicURL);

            //   // Create a new RawFootage entry in the database
            //   await prisma.rawFootage.create({
            //     data: {
            //       url: rawFootagePublicURL,
            //       submissionId: submission.id,
            //       campaignId: content.campaignId,
            //     },
            //   });

            //   console.log('✅ Raw footage entry created in the DB.');
            // }
          }

          // For photos
          if (filePaths?.photos?.length) {
            await Promise.all(
              filePaths.photos.map(async (photoPath: any) => {
                const photoFileName = `${submission.id}_${path.basename(photoPath)}`;
                const photoPublicURL = await uploadImage(photoPath, photoFileName, content.folder);
                await prisma.photo.create({
                  data: {
                    url: photoPublicURL,
                    submissionId: submission.id,
                    campaignId: content.campaignId,
                  },
                });
                await fs.promises.unlink(photoPath);
                console.log('✅ Photo entry created in the DB.');
              }),
            );

            // for (const photoPath of filePaths.photos) {
            //   const photoFileName = `${submission.id}_${path.basename(photoPath)}`;
            //   const photoPublicURL = await uploadImage(photoPath, photoFileName, content.folder);

            //   console.log('✅ Photo uploaded successfully:', photoPublicURL);

            //   // Save photo URL to database
            //   await prisma.photo.create({
            //     data: {
            //       url: photoPublicURL,
            //       submissionId: submission.id,
            //       campaignId: content.campaignId,
            //     },
            //   });

            //   await fs.promises.unlink(photoPath);

            //   console.log('✅ Photo entry created in the DB.');
            // }
          }

          await checkCurrentSubmission(submission.id);

          const endUsage = process.cpuUsage(startUsage);

          console.log(`CPU Usage: ${endUsage.user} microseconds (user) / ${endUsage.system} microseconds (system)`);

          for (const item of content.admins) {
            io.to(clients.get(item.admin.user.id)).emit('newSubmission');
          }

          const allSuperadmins = await prisma.user.findMany({
            where: {
              role: 'superadmin',
            },
          });

          for (const admin of allSuperadmins) {
            io.to(clients.get(admin.id)).emit('newSubmission');
          }
        } catch (error) {
          console.error('Error processing submission:', error);
        } finally {
          channel.ack(msg);
        }
      }
    });
  } catch (error) {
    console.error('Worker error:', error);
    throw error;
  }
})();
