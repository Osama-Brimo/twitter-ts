import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import db from '../graphql/context';

interface ClaimsInterface {
  sub: string;
}

const prodSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && !prodSecret) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const secret =
  prodSecret ||
  Buffer.from('aGVsbG93b3JsZCBoYXNoZWQgc2VjcmV0IGtleQ==', 'base64').toString();

export const createToken = (claims: ClaimsInterface): string =>
  jwt.sign(claims, secret, { expiresIn: '2h' });

export const checkPassword = (
  incoming: string,
  userPassword: string,
): Promise<boolean> => bcrypt.compare(incoming, userPassword);

export const getUserFromToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, secret) as ClaimsInterface;
    const user = await db.user.findUnique({
      where: { id: decoded.sub },
      include: {
        notifications: {
          orderBy: { createdAt: 'desc' },
          include: {
             participants: { include: { avatar: true } },
          },
        },
        followers: true,
        following: true,
        blockList: true,
        blockerList: true,
        vip: true,
        tweets: { orderBy: { createdAt: 'desc' } },
        retweets: { orderBy: { createdAt: 'desc' } },
        likes: { orderBy: { createdAt: 'desc' } },
        avatar: true,
      },
      omit: {
        password: true,
      },
    });

    return user;
  } catch (err) {
    throw new Error(err);
  }
};
