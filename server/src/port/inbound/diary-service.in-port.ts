import { CreateDiaryDto } from '@/adapter/inbound/dto/request/diary/create-diary.dto';
import { UpdateDiaryDto } from '@/adapter/inbound/dto/request/diary/update-diary.dto';
import { ShareDiaryDto } from '@/adapter/inbound/dto/request/diary/share-diary.dto';
import { DiaryResponseDto } from '@/adapter/inbound/dto/response/diary/diary-response.dto';
import { DiaryListPaginatedResponseDto } from '@/adapter/inbound/dto/response/diary/diary-list-response.dto';
import { DiaryTemplateResponseDto } from '@/adapter/inbound/dto/response/diary/diary-template-response.dto';

export abstract class DiaryServiceInPort {
    abstract create(userId: number, dto: CreateDiaryDto): Promise<DiaryResponseDto>;
    abstract findAll(userId: number, page: number, limit: number): Promise<DiaryListPaginatedResponseDto>;
    abstract findById(userId: number, diaryId: number): Promise<DiaryResponseDto>;
    abstract update(userId: number, diaryId: number, dto: UpdateDiaryDto): Promise<DiaryResponseDto>;
    abstract delete(userId: number, diaryId: number): Promise<void>;
    abstract share(userId: number, diaryId: number, dto: ShareDiaryDto): Promise<DiaryResponseDto>;
    abstract getTemplate(userId: number): Promise<DiaryTemplateResponseDto>;
}
