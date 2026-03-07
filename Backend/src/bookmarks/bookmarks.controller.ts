import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';

// บังคับให้ต้องเข้าสู่ระบบถึงจะเรียก API ของ Bookmark ได้ทั้งหมด
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  addBookmark(@Request() req, @Body() createBookmarkDto: CreateBookmarkDto) {
    // req.user.id มาจาก JwtAuthGuard
    return this.bookmarksService.addBookmark(req.user.id, createBookmarkDto.productId);
  }

  @Get()
  getBookmarks(@Request() req) {
    return this.bookmarksService.getBookmarksByUser(req.user.id);
  }

  @Delete(':productId')
  removeBookmark(@Request() req, @Param('productId') productId: string) {
    return this.bookmarksService.removeBookmark(req.user.id, productId);
  }
}