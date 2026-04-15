import 'dotenv/config';
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const databaseURL = process.env.DATABASE_URL;
        if (!databaseURL) {
            throw new Error("DATABASE_URL não esta declarada no .env");
        }
        
        const url = new URL(databaseURL);
        const schema = url.searchParams.get('schema') || 'public';
        url.searchParams.delete('schema');
        url.searchParams.append('options', `-c search_path=${schema},public`);

        const pool = new Pool({ connectionString: url.toString() });
        const adapter = new PrismaPg(pool);

        // Evitar erro de tipagem restrita do Prisma v7 e inicializar via driver Adapter
        super({ adapter } as any);
    }

    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
}