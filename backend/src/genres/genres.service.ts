import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenreDto } from './dto/genre.dto';
import { Genre } from './genre.entity';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genresRepository: Repository<Genre>,
  ) {}

  findAll(): Promise<Genre[]> {
    return this.genresRepository.find({ order: { name: 'ASC' } });
  }

  async create(dto: GenreDto): Promise<Genre> {
    await this.ensureNameIsFree(dto.name);
    return this.genresRepository.save(this.genresRepository.create(dto));
  }

  async update(id: number, dto: GenreDto): Promise<Genre> {
    const genre = await this.findOneOrFail(id);
    if (genre.name !== dto.name) {
      await this.ensureNameIsFree(dto.name);
    }
    genre.name = dto.name;
    return this.genresRepository.save(genre);
  }

  async remove(id: number): Promise<void> {
    const genre = await this.findOneOrFail(id);
    await this.genresRepository.remove(genre);
  }

  private async findOneOrFail(id: number): Promise<Genre> {
    const genre = await this.genresRepository.findOne({ where: { id } });
    if (!genre) {
      throw new NotFoundException('Zanr ne postoji');
    }
    return genre;
  }

  private async ensureNameIsFree(name: string): Promise<void> {
    const existing = await this.genresRepository.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Zanr sa tim nazivom vec postoji');
    }
  }
}