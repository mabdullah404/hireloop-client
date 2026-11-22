import { MongoClient, Db } from "mongodb"

// MongoDB কানেকশন স্ট্রিং এনভায়রনমেন্ট ভেরিয়েবল থেকে নেওয়া হচ্ছে
const uri = process.env.BETTER_AUTH_MONGO_DB_URL as string

let client: MongoClient

// ডেভেলপমেন্টে হট রিলোডে বারবার কানেকশন তৈরি রোধ করতে গ্লোবাল ক্যাশ ব্যবহার করা হচ্ছে
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()
}
const clientPromise = global._mongoClientPromise

// getDb ফাংশন কল করলেই সরাসরি hireloop ডাটাবেজের অবজেক্ট পাওয়া যাবে
export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise
  return connectedClient.db("hireloop")
}
