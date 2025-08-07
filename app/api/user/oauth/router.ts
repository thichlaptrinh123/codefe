// ✅ app/api/auth/oauth/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import User from '@/model/user';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, username, avatar } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username,
        email,
        avatar,
        provider: 'google',
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone || '',
      },
    });
  } catch (error: any) {
    console.error('[GOOGLE OAUTH ERROR]', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { email, username, phone } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        username,
        phone,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error: any) {
    console.error('[OAUTH UPDATE ERROR]', error);
    return NextResponse.json({
      success: false,
      message: `Server error: ${error.message}`,
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'GET not allowed' }, { status: 405 });
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}