import { ForbiddenException, Injectable } from '@nestjs/common';
import { Bookmark, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}

    async getAll(userId: User['id']) {
        return await this.prisma.bookmark.findMany({
            where: {
                userId,
            },
        });
    }

    async getById(userId: User['id'], id: Bookmark['id']) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id,
            },
        });

        return bookmark;
    }

    async create(userId: User['id'], dto: CreateBookmarkDto) {
        const bookmark = this.prisma.bookmark.create({
            data: {
                ...dto,
                userId,
            },
        });

        return bookmark;
    }

    async editById(userId: User['id'], id: Bookmark['id'], dto: EditBookmarkDto) {
        let bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id,
            },
        });

        if (!bookmark || bookmark?.userId !== userId) {
            throw new ForbiddenException('You are not authorized to edit this bookmark.');
        }

        return await this.prisma.bookmark.update({
            where: {
                id,
            },
            data: {
                ...dto,
            },
        });
    }

    async deleteById(userId: User['id'], id: Bookmark['id']) {
        const bookmark = await this.prisma.bookmark.findUnique({
            where: {
                id,
            },
        });

        if (!bookmark || bookmark?.userId !== userId) {
            throw new ForbiddenException('You are not authorized to delete this bookmark.');
        }

        return await this.prisma.bookmark.delete({
            where: {
                id
            },
        });
    }
}
