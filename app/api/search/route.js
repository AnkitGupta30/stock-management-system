import {MongoClient} from "mongodb"
import { NextResponse } from 'next/server';

export async function GET(request){
    const query = request.nextUrl.searchParams.get("query");
    console.log(query, typeof query)
const uri = "mongodb+srv://ankitkumar01121:Ankit7295@cluster0.vr6q374.mongodb.net/";

const client = new MongoClient(uri);

  try {
    const database = client.db('stock');
    const inventory = database.collection('inventory');
    const products = await inventory.aggregate([{
        $match:{
          $or : [
            {slug: {$regex: query, $options: "i"}},
          ]
        }
      }]).toArray();
    return NextResponse.json({success: true, products})
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

