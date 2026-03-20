import { MongoClient } from "mongodb";
console.log("MONGODB_URI (mongodb.ts)", process.env.MONGODB_URI);
const uri = process.env.MONGODB_URI;
const options = {};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const clientPromise: Promise<MongoClient> = (() => {
  if (!uri) {
    // Do not crash on import; reject instead.
    return Promise.reject(new Error("MONGODB_URI environment variable is not set.")) as Promise<MongoClient>
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }

  return global._mongoClientPromise!
})()

export default clientPromise