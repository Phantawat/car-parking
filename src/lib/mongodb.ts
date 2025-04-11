import mongoose from "mongoose";

class MongoDB {
  private static instance: MongoDB;
  private conn: typeof mongoose | null = null;
  private promise: Promise<typeof mongoose> | null = null;
  private readonly uri: string;

  private constructor() {
    this.uri = process.env.MONGODB_URI as string;

    if (!this.uri) {
      throw new Error("Please define the MONGODB_URI environment variable.");
    }
  }

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
    }
    return MongoDB.instance;
  }

  public async connect(): Promise<typeof mongoose> {
    if (this.conn) return this.conn;

    if (!this.promise) {
      this.promise = mongoose.connect(this.uri).then((mongoose) => mongoose);
    }

    this.conn = await this.promise;
    return this.conn;
  }
}

export default MongoDB;