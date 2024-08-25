import 'module-alias/register';
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
// import FacebookStrategy from 'passport-facebook';
import 'src/config/cronjob';
import http from 'http';
import { markMessagesAsSeen } from './controller/threadController';
import { handleSendMessage, fetchMessagesFromThread } from './service/threadService';
import { isLoggedIn } from './middleware/onlyLogin';
import { Server, Socket } from 'socket.io';
import 'src/service/uploadVideo';
import 'src/helper/videoDraft';
// import dotenvx from '@dotenvx/dotenvx';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);
export const io = new Server(server, { connectionStateRecovery: {} });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  fileUpload({
    // limits: { fileSize: 50 * 1024 * 1024 },
    useTempFiles: true,
    tempFileDir: '/tmp/',
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
  // user: 'afiqdanial',
  connectionString: process.env.DATABASE_URL,
  // host: 'localhost',
  // database: 'cult_creative',
  // password: 'postgres',
  // port: 5431,
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

// passport.use(
//   new FacebookStrategy.Strategy(
//     {
//       clientID: process.env.APP_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//       callbackURL: 'https://app.cultcreativeasia.com/api/auth/facebook/callback',
//       enableProof: true,

//       profileFields: ['id', 'displayName', 'photos', 'email'], // Optional fields to request
//     } as any,
//     function (accessToken: any, refreshToken: any, profile: any, done: any) {
//       // Save the accessToken and profile information in your database
//       // For now, we will just log it
//       console.log('Access Token:', accessToken);
//       console.log('Profile:', profile);
//       return done(null, profile);
//     },
//   ),
// );

app.use(router);

// app.get(
//   '/auth/facebook',
//   passport.authenticate('facebook', {
//     scope: ['pages_show_list', 'business_management', 'instagram_basic', 'pages_manage_metadata'],
//   }),
// );

// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
//   // Successful authentication
//   res.redirect('/');
// });

app.get('/', (_req: Request, res: Response) => {
  res.send(`${process.env.NODE_ENV} is running...`);
});

app.get('/users', isLoggedIn, async (_req, res) => {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany();
    res.send(users);
  } catch (error) {
    console.log(error);
  }
});

export const clients = new Map();
export const activeProcesses = new Map();

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
      console.log(`Processing for video ${submissionId} has been cancelled.`);
      socket.emit('progress', { submissionId, progress: 0 }); // Reset progress
    }
  });

  // Joins a room for every thread
  socket.on('room', async (threadId: any) => {
    try {
      // Join the room specified by threadId
      socket.join(threadId);
      console.log(`Client joined room: ${threadId}`);

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
  socket.on('sendMessage', async (message) => {
    await handleSendMessage(message, io);
    io.to(message.threadId).emit('latestMessage', message);
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
    console.log('Client disconnected:', socket.id);
    clients.forEach((value, key) => {
      if (value === socket.id) {
        clients.delete(key);
        console.log(`Removed user ${key} from clients map`);
      }
    });
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}...`);
  console.log(`${process.env.NODE_ENV} stage is running...`);
});
