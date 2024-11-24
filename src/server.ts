import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router } from '@routes/index';
import session from 'express-session';
import pg from 'pg';
import cookieParser from 'cookie-parser';
import connectPgSimple from 'connect-pg-simple';
import fileUpload from 'express-fileupload';
import { PrismaClient } from '@prisma/client';
import passport from 'passport';
import '@configs/cronjob';
import http from 'http';
import { markMessagesAsSeen, sendMessageInThread } from '@controllers/threadController';
import { fetchMessagesFromThread } from '@services/threadService';
import { isLoggedIn } from '@middlewares/onlyLogin';
import { Server, Socket } from 'socket.io';
import '@services/uploadVideo';
import './helper/videoDraft';
import './helper/videoDraftWorker';
import './helper/processPitchVideo';
import dotenv from 'dotenv';
import '@services/google_sheets/sheets';
import { accessGoogleSheetAPI, createNewRowData, createNewSpreadSheet } from '@services/google_sheets/sheets';
import { status } from '@dotenvx/dotenvx';
import path from 'path';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
export const io = new Server(server, {
  connectionStateRecovery: {},
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  fileUpload({
    // limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/',
    // debug: true,
  }),
);

const corsOptions = {
  origin: true, //included origin as true
  credentials: true, //included credentials as true
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.disable('x-powered-by');

// create the session here
declare module 'express-session' {
  interface SessionData {
    userid: string;
    refreshToken: string;
    name: string;
    role: string;
    photoURL: string;
    xeroToken: any;
    xeroTokenid: any;
    xeroTokenSet: any;
    xeroTenants: any;
    xeroActiveTenants: any;
  }
}

// you have to create a table in PostgreSQL to store the session
// the following command will create the table in PostgreSQL
//  you have to key in the command on each build
//  CREATE TABLE session (
//   sid VARCHAR(255) PRIMARY KEY NOT NULL,
//   sess JSON NOT NULL,
//   expire TIMESTAMP WITH TIME ZONE NOT NULL
// );

// store session in PostgreSQL
const pgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET as string,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000, //expires in 24hours
  },
  store: new pgSession({
    pool: pgPool,
    tableName: 'session',
  }),
});

app.use(sessionMiddleware);

io.use((socket: Socket, next: any) => {
  return sessionMiddleware(socket.request as any, {} as any, next as any);
});

app.use(passport.initialize());

app.use(passport.session());

app.use(router);

app.get('/', (_req: Request, res: Response) => {
  res.send(`${process.env.NODE_ENV} is running...`);
});

app.get('/users', isLoggedIn, async (_req, res) => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    res.send(users);
  } catch (error) {
    //console.log(error);
  }
});

export const clients = new Map();
export const activeProcesses = new Map();
export const queue = new Map();

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    clients.set(userId, socket.id);
  });

  socket.on('cancel-processing', (data) => {
    const { submissionId } = data;

    if (activeProcesses.has(submissionId)) {
      const command = activeProcesses.get(submissionId);
      command.kill('SIGKILL'); // Terminate the FFmpeg process
      activeProcesses.delete(submissionId);

      socket.emit('progress', { submissionId, progress: 0 }); // Reset progress
    }
  });

  socket.on('checkQueue', (data) => {
    if (activeProcesses.has(data?.submissionId)) {
      const item = activeProcesses.get(data.submissionId);
      if (item?.status === 'queue') {
        socket.emit('statusQueue', { status: 'queue' });
      }
    }
  });

  // Joins a room for every thread
  socket.on('room', async (threadId: any) => {
    try {
      // Join the room specified by threadId
      socket.join(threadId);
      //console.log(`Client joined room: ${threadId}`);

      // Fetch old messages using the service
      const oldMessages = await fetchMessagesFromThread(threadId);

      // Emit old messages to the client
      socket.emit('existingMessages', { threadId, oldMessages });
    } catch (error) {
      console.error('Error fetching messages:', error);

      // Optionally, emit an error event to the client
      socket.emit('error', 'Failed to fetch messages');
    }
  });
  // Sends message and saves to database
  // socket.on('sendMessage', async (message) => {
    
  //    await handleSendMessage(message, io);
  //   // if (message) {
  //   //   io.to(message.threadId).emit('latestMessage', message);
  //   //   console.log("Latest Message", message);
  //   // }
  //   // io.to(message.threadId).emit('latestMessage', message);
  //   // console.log("Latest Message", message)
  // });

  socket.on('sendMessage', async (message) => {
    const { senderId, threadId, content, file, fileType } = message;

    // Simulate the `req` (Request) and `res` (Response) objects used in sendMessageInThread
    const req = {
      body: { threadId, content },
      session: { userid: senderId },
      files: file ? { file } : null,  
    } as Partial<Request>;
  
    const res = {
      status: (code: number) => ({
        json: (data: any) => {
          console.log('Message sent successfully:');
        },
      }),
    } as unknown as Response;
  
    try {
      // Call sendMessageInThread directly
      await sendMessageInThread(req as Request, res);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('markMessagesAsSeen', async ({ threadId, userId }) => {
    if (!userId) {
      socket.emit('error', 'User not authenticated.');
      return;
    }

    try {
      const mockRequest = {
        params: { threadId },
        session: { userid: userId },
        cookies: {},
        headers: {},
      } as unknown as Request;

      await markMessagesAsSeen(mockRequest, {} as Response);
      io.to(threadId).emit('messagesSeen', { threadId, userId });
    } catch (error) {
      console.error('Error marking messages as seen:', error);
      socket.emit('error', 'Failed to mark messages as seen.');
    }
  });

  socket.on('disconnect', () => {
    //console.log('Client disconnected:', socket.id);
    clients.forEach((value, key) => {
      if (value === socket.id) {
        clients.delete(key);
        //console.log(`Removed user ${key} from clients map`);
      }
    });
  });
});

// Testing chunk upload API

// app.post('/upload-chunk', async (req: Request, res: Response) => {
//   try {
//     const { fileName, chunkIndex, totalChunks } = req.body;
//     const tempDir = path.join(__dirname, 'temp', fileName);
//     const chunkPath = path.join(tempDir, `chunk-${chunkIndex}`);

//     await fs.mkdir(tempDir, { recursive: true });

//     await fs.copyFile((req.files as any).chunk.tempFilePath, chunkPath);

//     await fs.unlink((req.files as any).chunk.tempFilePath);

//     const uploadedChunks = await fs.readdir(tempDir);

//     if (uploadedChunks.length === parseInt(totalChunks)) {
//       const finalFilePath = path.join(__dirname, 'uploads', fileName);

//       await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });

//       const writeStream = ps.createWriteStream(finalFilePath);
//       for (let i = 0; i < totalChunks; i++) {
//         const chunkData = await fs.readFile(path.join(tempDir, `chunk-${i}`));
//         writeStream.write(chunkData);
//       }
//       writeStream.end();

//       await fs.rm(tempDir, { force: true, recursive: true });

//       console.log(`File ${fileName} reassembled successfully`);
//       // await fs.unlink(path.join(__dirname, 'uploads', fileName));
//       const amqp = await amqplib.connect(process.env.RABBIT_MQ as string);
//       const channel = amqp.createChannel();
//       (await channel).assertQueue('test');

//       (await channel).sendToQueue(
//         'test',
//         Buffer.from(JSON.stringify({ path: path.join(__dirname, 'uploads', fileName) })),
//       );
//     }

//     res.status(200).send('Chunk uploaded successfully');
//   } catch (error) {
//     return res.status(400).json(error);
//   }
// });

server.listen(process.env.PORT, () => {
  //console.log(`Listening to port ${process.env.PORT}...`);
  //console.log(`${process.env.NODE_ENV} stage is running...`);
});
