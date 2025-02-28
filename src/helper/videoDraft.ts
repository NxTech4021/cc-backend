// /* eslint-disable promise/always-return */

// import workerpool from 'workerpool';
// import Ffmpeg from 'fluent-ffmpeg';
// import ffmpegPath from '@ffmpeg-installer/ffmpeg';
// import ffprobePath from '@ffprobe-installer/ffprobe';
// import fs from 'fs';
// import { uploadPitchVideo } from '@configs/cloudStorage.config';
// import amqplib from 'amqplib';
// import { activeProcesses, clients, io } from '../server';
// import { Entity, PrismaClient } from '@prisma/client';
// import { saveNotification } from '@controllers/notificationController';
// import { spawn } from 'child_process';
// import dayjs from 'dayjs';
// import { notificationDraft } from './notification';
// import { createNewTask, getTaskId, updateTask } from '@services/kanbanService';
// import { createNewRowData } from '@services/google_sheets/sheets';

// Ffmpeg.setFfmpegPath(ffmpegPath.path);
// Ffmpeg.setFfprobePath(ffprobePath.path);

// const prisma = new PrismaClient();

// interface VideoData {
//   userid: string;
//   inputPath: string;
//   outputPath: string;
//   submissionId: string;
//   fileName: string;
//   folder: string;
//   caption: string;
//   admins: { admin: { user: { id: string } } }[];
// }

// const processVideo = async (videoData: VideoData): Promise<void> => {
//   return new Promise<void>((resolve, reject) => {
//     const { userid, inputPath, outputPath, submissionId, fileName, folder, caption } = videoData;
//     const command = Ffmpeg(inputPath)
//       .outputOptions([
//         '-c:v libx264',
//         '-crf 26',
//         '-pix_fmt yuv420p',
//         '-preset ultrafast',
//         '-map 0:v:0',
//         '-map 0:a:0?',
//         '-threads 4',
//       ])
//       .save(outputPath)
//       .on('progress', (progress) => {
//         activeProcesses.set(submissionId, command);
//         const percentage = Math.round(progress.percent || 0);
//         io?.to(clients.get(userid)!).emit('progress', {
//           progress: percentage,
//           submissionId,
//           name: 'Compression Start',
//         });
//       })
//       .on('end', async () => {
//         try {
//           const size = (await fs.promises.stat(outputPath)).size;

//           const publicURL = await uploadPitchVideo(
//             outputPath,
//             fileName,
//             folder,
//             (data: number) => {
//               io?.to(clients.get(userid)!).emit('progress', {
//                 progress: data,
//                 submissionId,
//                 name: 'Uploading Start',
//               });
//             },
//             size,
//           );

//           const data = await prisma.submission.update({
//             where: { id: submissionId },
//             data: {
//               content: publicURL,
//               caption,
//               status: 'PENDING_REVIEW',
//               submissionDate: dayjs().toISOString(),
//             },
//             include: {
//               submissionType: true,
//               campaign: {
//                 include: {
//                   campaignAdmin: {
//                     select: {
//                       adminId: true,
//                       admin: { include: { user: { include: { Board: { include: { columns: true } } } } } },
//                     },
//                   },
//                 },
//               },
//               user: { include: { creator: true } },
//             },
//           });

//           if (data.campaign.spreadSheetURL) {
//             const spreadSheetId = data.campaign.spreadSheetURL.split('/d/')[1].split('/')[0];
//             await createNewRowData({
//               creatorInfo: {
//                 name: data.user.name as string,
//                 username: data.user.creator?.instagram as string,
//                 postingDate: dayjs().format('LL'),
//                 caption,
//                 videoLink: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${data?.submissionType.type}/${data?.id}_draft.mp4?v=${dayjs().toISOString()}`,
//               },
//               spreadSheetId,
//             });
//           }

//           const { title, message } = notificationDraft(data.campaign.name, 'Creator');

//           const notification = await saveNotification({
//             userId: data.userId,
//             message: message,
//             title: title,
//             entity: 'Draft',
//             entityId: data.campaign.id,
//           });

//           io?.to(clients.get(data.userId)).emit('notification', notification);

//           const { title: adminTitle, message: adminMessage } = notificationDraft(
//             data.campaign.name,
//             'Admin',
//             data.user.name as string,
//           );

//           for (const item of data.campaign.campaignAdmin) {
//             const notification = await saveNotification({
//               userId: item.adminId,
//               message: adminMessage,
//               creatorId: userid,
//               title: adminTitle,
//               entity: 'Draft',
//               entityId: data.campaignId,
//             });

//             if (item.admin.user.Board) {
//               const actionNeededColumn = item.admin.user.Board.columns.find((item) => item.name === 'Actions Needed');

//               const taskInDone = await getTaskId({
//                 boardId: item.admin.user.Board.id,
//                 submissionId: data.id,
//                 columnName: 'Done',
//               });

//               if (actionNeededColumn) {
//                 if (taskInDone) {
//                   await updateTask({
//                     taskId: taskInDone.id,
//                     toColumnId: actionNeededColumn.id,
//                     userId: item.admin.user.id,
//                   });
//                 } else {
//                   await createNewTask({
//                     submissionId: data.id,
//                     name: 'Draft Submission',
//                     userId: item.admin.user.id,
//                     position: 1,
//                     columnId: actionNeededColumn.id,
//                   });
//                 }
//               }
//             }

//             if (io) {
//               io.to(clients.get(item.adminId)).emit('notification', notification);
//             }
//           }

//           activeProcesses.delete(submissionId);
//           io?.to(clients.get(userid)!).emit('progress', { submissionId, progress: 100 });
//           await fs.promises.unlink(inputPath);
//           await fs.promises.unlink(outputPath);
//           resolve();
//         } catch (error) {
//           reject(error);
//         }
//       })
//       .on('error', (err) => {
//         console.error('Error processing video:', err);
//         activeProcesses.delete(submissionId);
//         reject(err);
//         fs.unlinkSync(inputPath);
//       });
//   });
// };

// (async () => {
//   try {
//     const conn = await amqplib.connect(process.env.RABBIT_MQ!);
//     const channel = await conn.createChannel();
//     await channel.assertQueue('draft', { durable: true });
//     await channel.purgeQueue('draft');
//     console.log('Consumer 2 Starting...');
//     const startUsage = process.cpuUsage();

//     await channel.consume('draft', async (msg) => {
//       if (msg) {
//         const content: VideoData = JSON.parse(msg.content.toString());
//         await processVideo(content);
//         channel.ack(msg);
//         const endUsage = process.cpuUsage(startUsage);
//         console.log(`CPU Usage: ${endUsage.user} microseconds (user) / ${endUsage.system} microseconds (system)`);

//         for (const item of content.admins) {
//           io.to(clients.get(item.admin.user.id)!).emit('newSubmission');
//         }

//         const allSuperadmins = await prisma.user.findMany({
//           where: {
//             role: 'superadmin',
//           },
//         });

//         for (const admin of allSuperadmins) {
//           io.to(clients.get(admin.id)).emit('newSubmission');
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Error in message queue consumer:', error);
//   }
// })();

/* eslint-disable promise/always-return */

import Ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import fs from 'fs';
import { uploadPitchVideo } from '@configs/cloudStorage.config';
import amqplib from 'amqplib';
import { activeProcesses, clients, io } from '../server';
import { PrismaClient } from '@prisma/client';
import { saveNotification } from '@controllers/notificationController';
import dayjs from 'dayjs';
import { notificationDraft } from './notification';
import { createNewTask, getTaskId, updateTask } from '@services/kanbanService';
import { createNewRowData } from '@services/google_sheets/sheets';

Ffmpeg.setFfmpegPath(ffmpegPath.path);
Ffmpeg.setFfprobePath(ffprobePath.path);

const prisma = new PrismaClient();

interface VideoData {
  userid: string;
  inputPath: string;
  outputPath: string;
  submissionId: string;
  fileName: string;
  folder: string;
  caption: string;
  admins: { admin: { user: { id: string } } }[];
}

const processVideo = async (videoData: VideoData): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const { userid, inputPath, outputPath, submissionId } = videoData;
    const command = Ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-crf 26',
        '-pix_fmt yuv420p',
        '-preset ultrafast',
        '-map 0:v:0',
        '-map 0:a:0?',
        '-threads 4',
      ])
      .save(outputPath)
      .on('progress', (progress) => {
        activeProcesses.set(submissionId, command);
        const percentage = Math.round(progress.percent || 0);
        const socket = clients.get(userid);
        if (socket) {
          io?.to(socket).emit('progress', { progress: percentage, submissionId, name: 'Compression Start' });
        }
      })
      .on('end', () => {
        activeProcesses.delete(submissionId);
        resolve(outputPath);
      })
      .on('error', async (err) => {
        console.error('Error processing video:', err);
        activeProcesses.delete(submissionId);
        if (inputPath) {
          fs.unlinkSync(inputPath);
        }
        reject(err);
      });
  });
};

(async () => {
  try {
    const conn = await amqplib.connect(process.env.RABBIT_MQ!);
    const channel = await conn.createChannel();
    await channel.assertQueue('draft', { durable: true });
    // await channel.purgeQueue('draft');
    console.log('Worker 2 is running');

    await channel.consume('draft', async (msg) => {
      if (!msg) return;
      const startUsage = process.cpuUsage();

      try {
        const content: VideoData = JSON.parse(msg.content.toString());

        console.log('Receive', content.fileName);

        const compressedPath = await processVideo(content);

        console.log('Processing Done');
        const size = (await fs.promises.stat(compressedPath)).size;

        const publicURL = await uploadPitchVideo(
          compressedPath,
          content.fileName,
          content.folder,
          (data: number) => {
            const socket = clients.get(content.userid);
            if (socket) {
              io
                ?.to(socket)
                .emit('progress', { progress: data, submissionId: content.submissionId, name: 'Uploading Start' });
            }
          },
          size,
        );

        console.log('Uploading Done');

        const data = await prisma.submission.update({
          where: { id: content.submissionId },
          data: {
            content: publicURL,
            caption: content.caption,
            status: 'PENDING_REVIEW',
            submissionDate: dayjs().toISOString(),
          },
          include: {
            submissionType: true,
            campaign: {
              include: {
                campaignAdmin: {
                  select: {
                    adminId: true,
                    admin: { include: { user: { include: { Board: { include: { columns: true } } } } } },
                  },
                },
              },
            },
            user: { include: { creator: true } },
          },
        });

        io?.to(clients.get(content.userid))?.emit('progress', { submissionId: content.submissionId, progress: 100 });

        if (data.campaign.spreadSheetURL) {
          const spreadSheetId = data.campaign.spreadSheetURL.split('/d/')[1].split('/')[0];
          await createNewRowData({
            creatorInfo: {
              name: data.user.name as string,
              username: data.user.creator?.instagram as string,
              postingDate: dayjs().format('LL'),
              caption: content.caption,
              videoLink: `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${data?.submissionType.type}/${data?.id}_draft.mp4?v=${dayjs().toISOString()}`,
            },
            spreadSheetId,
          });
        }

        const { title, message } = notificationDraft(data.campaign.name, 'Creator');

        const notification = await saveNotification({
          userId: data.userId,
          message,
          title,
          entity: 'Draft',
          entityId: data.campaign.id,
        });

        io?.to(clients.get(data.userId))?.emit('notification', notification);

        const { title: adminTitle, message: adminMessage } = notificationDraft(
          data.campaign.name,
          'Admin',
          data.user.name as string,
        );

        for (const item of data.campaign.campaignAdmin) {
          const notification = await saveNotification({
            userId: item.adminId,
            message: adminMessage,
            creatorId: content.userid,
            title: adminTitle,
            entity: 'Draft',
            entityId: data.campaignId,
          });

          if (item.admin.user.Board) {
            const actionNeededColumn = item.admin.user.Board.columns.find((col) => col.name === 'Actions Needed');

            if (actionNeededColumn) {
              const taskInDone = await getTaskId({
                boardId: item.admin.user.Board.id,
                submissionId: data.id,
                columnName: 'Done',
              });

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

          io?.to(clients.get(item.adminId))?.emit('notification', notification);
        }

        await fs.promises.unlink(content.inputPath).catch(console.error);
        await fs.promises.unlink(content.outputPath).catch(console.error);
      } catch (error) {
        console.error('Error processing video:', error);
      } finally {
        channel.ack(msg);
        const endUsage = process.cpuUsage(startUsage);
        console.log(`CPU Usage: ${endUsage.user} µs (user) / ${endUsage.system} µs (system)`);
      }
    });
  } catch (error) {
    console.error('Error in message queue consumer:', error);
  }
})();
