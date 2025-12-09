import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { CreateDiaryDto } from '@/adapter/inbound/dto/request/diary/create-diary.dto';
import { UpdateDiaryDto } from '@/adapter/inbound/dto/request/diary/update-diary.dto';
import { ShareDiaryDto } from '@/adapter/inbound/dto/request/diary/share-diary.dto';
import { DiaryResponseDto } from '@/adapter/inbound/dto/response/diary/diary-response.dto';
import { DiaryListPaginatedResponseDto, DiaryListResponseDto } from '@/adapter/inbound/dto/response/diary/diary-list-response.dto';
import { DiaryTemplateResponseDto } from '@/adapter/inbound/dto/response/diary/diary-template-response.dto';
import { Diary } from '@/domain/entity/diary.entity';
import { DiaryServiceInPort } from '@/port/inbound/diary-service.in-port';
import { DiaryServiceOutPort } from '@/port/outbound/diary-service.out-port';
import { EmotionAnalysisService } from './emotion-analysis.service';
import { PostServiceOutPort } from '@/port/outbound/post-service.out-port';

@Injectable()
export class DiaryService implements DiaryServiceInPort {
    constructor(
        private readonly diaryRepository: DiaryServiceOutPort,
        private readonly emotionAnalysisService: EmotionAnalysisService,
        private readonly postRepository: PostServiceOutPort,
    ) { }

    async create(userId: number, dto: CreateDiaryDto): Promise<DiaryResponseDto> {
        const user = await this.diaryRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        // AI 감정 분석
        const analysisResult = await this.emotionAnalysisService.analyze(dto.content, user.userType);

        const diary = new Diary();
        diary.user = user;
        diary.content = dto.content;
        diary.emotionScore = analysisResult.emotionScore;
        diary.emotionKeywords = analysisResult.emotionKeywords;
        diary.comfortMessage = analysisResult.comfortMessage;
        diary.isShared = false;

        const savedDiary = await this.diaryRepository.save(diary);
        return this.toDiaryResponse(savedDiary);
    }

    async findAll(userId: number, page: number, limit: number): Promise<DiaryListPaginatedResponseDto> {
        const { items, total } = await this.diaryRepository.findAllByUser(userId, page, limit);

        const diaryList: DiaryListResponseDto[] = items.map(diary => ({
            id: diary.id,
            contentPreview: diary.content.substring(0, 100) + (diary.content.length > 100 ? '...' : ''),
            emotionScore: diary.emotionScore,
            emotionKeywords: diary.emotionKeywords,
            isShared: diary.isShared,
            createdAt: diary.createdAt,
        }));

        return {
            items: diaryList,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(userId: number, diaryId: number): Promise<DiaryResponseDto> {
        const diary = await this.diaryRepository.findByIdAndUser(diaryId, userId);
        if (!diary) {
            throw new NotFoundException('일기를 찾을 수 없습니다.');
        }
        return this.toDiaryResponse(diary);
    }

    async update(userId: number, diaryId: number, dto: UpdateDiaryDto): Promise<DiaryResponseDto> {
        const diary = await this.diaryRepository.findByIdAndUser(diaryId, userId);
        if (!diary) {
            throw new NotFoundException('일기를 찾을 수 없습니다.');
        }

        if (dto.content) {
            const user = await this.diaryRepository.findUserById(userId);
            if (!user) {
                throw new NotFoundException('사용자를 찾을 수 없습니다.');
            }

            // 내용이 변경되면 AI 재분석
            const analysisResult = await this.emotionAnalysisService.analyze(dto.content, user.userType);
            diary.content = dto.content;
            diary.emotionScore = analysisResult.emotionScore;
            diary.emotionKeywords = analysisResult.emotionKeywords;
            diary.comfortMessage = analysisResult.comfortMessage;
        }

        const updatedDiary = await this.diaryRepository.update(diary);
        return this.toDiaryResponse(updatedDiary);
    }

    async delete(userId: number, diaryId: number): Promise<void> {
        const diary = await this.diaryRepository.findByIdAndUser(diaryId, userId);
        if (!diary) {
            throw new NotFoundException('일기를 찾을 수 없습니다.');
        }
        await this.diaryRepository.delete(diary);
    }

    async share(userId: number, diaryId: number, dto: ShareDiaryDto): Promise<DiaryResponseDto> {
        const diary = await this.diaryRepository.findByIdAndUser(diaryId, userId);
        if (!diary) {
            throw new NotFoundException('일기를 찾을 수 없습니다.');
        }

        if (diary.isShared) {
            throw new ForbiddenException('이미 공유된 일기입니다.');
        }

        const user = await this.diaryRepository.findUserById(userId);
        if (!user) {
            throw new NotFoundException('사용자를 찾을 수 없습니다.');
        }

        // 게시물 생성
        const post = await this.postRepository.createFromDiary({
            userId,
            diaryId,
            content: diary.content,
            category: dto.category || user.userType as any,
            isAnonymous: dto.isAnonymous,
            authorNickname: dto.isAnonymous ? '익명' : user.nickname,
        });

        diary.isShared = true;
        diary.postId = post.id;

        const updatedDiary = await this.diaryRepository.update(diary);
        return this.toDiaryResponse(updatedDiary);
    }

    async getTemplate(userId: number): Promise<DiaryTemplateResponseDto> {
        const averageScore = await this.diaryRepository.getAverageEmotionScore(userId);

        if (averageScore >= 30) {
            return {
                templateType: 'POSITIVE',
                placeholder: '오늘은 어떤 좋은 일이 있었나요?',
                encouragement: '점점 나아지고 있어요 ✨',
                averageEmotionScore: averageScore,
            };
        } else if (averageScore <= -30) {
            return {
                templateType: 'NEGATIVE',
                placeholder: '힘든 마음을 편하게 털어놓으세요',
                encouragement: '괜찮아요, 함께할게요 💙',
                averageEmotionScore: averageScore,
            };
        }
        return {
            templateType: 'NEUTRAL',
            placeholder: '오늘 하루는 어땠나요?',
            encouragement: '천천히 나아가고 있어요',
            averageEmotionScore: averageScore,
        };
    }

    private toDiaryResponse(diary: Diary): DiaryResponseDto {
        return plainToInstance(DiaryResponseDto, {
            id: diary.id,
            content: diary.content,
            emotionScore: diary.emotionScore,
            emotionKeywords: diary.emotionKeywords,
            comfortMessage: diary.comfortMessage,
            isShared: diary.isShared,
            postId: diary.postId,
            createdAt: diary.createdAt,
            updatedAt: diary.updatedAt,
        }, { excludeExtraneousValues: true });
    }
}
