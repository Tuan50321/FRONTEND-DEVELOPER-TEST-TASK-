import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB not configured (missing MONGODB_URI)' },
        { status: 503 },
      );
    }
    const client = await clientPromise;
    const db = client.db('learning-app');
    const collections = await db.collections();
    return NextResponse.json({ 
      message: 'Connected to MongoDB successfully!', 
      collections: collections.map(c => c.collectionName) 
    });
  } catch (error: any) {
    console.error('MongoDB connection error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect to MongoDB', 
      details: error.message 
    }, { status: 500 });
  }
}