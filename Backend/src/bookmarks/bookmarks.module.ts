import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { Bookmark } from './entities/bookmark.entity';
import { Product } from '../products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Product])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}