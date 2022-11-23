import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { EditBookmarkDto } from './dto/edit-bookmark.dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
    constructor(private bookmarkService: BookmarkService) {}

    @Get()
    getBookmarks(@GetUser('id') userId: number) {
        return this.bookmarkService.getAll(userId);
    }

    @Get(':id')
    getBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.bookmarkService.getById(userId, id);
    }

    @Post()
    createBookmark(
        @GetUser('id') userId: number,
        @Body() dto: CreateBookmarkDto,
    ) {
        return this.bookmarkService.create(userId, dto);
    }

    @Patch(':id')
    editBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) id: number, 
        @Body() dto: EditBookmarkDto,
    ) {
        return this.bookmarkService.editById(userId, id, dto);
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    deleteBookmarkById(
        @GetUser('id') userId: number,
        @Param('id', ParseIntPipe) id: number,
    ) {
        return this.bookmarkService.deleteById(userId, id);
    }
}
