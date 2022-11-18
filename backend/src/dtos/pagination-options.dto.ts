import {
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsString,
  IsEnum,
} from 'class-validator'
import { Expose } from 'class-transformer'

export class PaginationOptionsDto {
  @Expose()
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @Min(1)
  page = 1

  @Expose()
  @IsOptional()
  @IsNumber({ allowInfinity: false, allowNaN: false, maxDecimalPlaces: 0 })
  @Min(1)
  @Max(100)
  perPage = 10

  @Expose()
  @IsOptional()
  @IsString()
  q?: string

  @Expose()
  @IsOptional()
  @IsString()
  sortField?: string

  @Expose()
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDirection?: string

  get skip() {
    return (this.page - 1) * this.perPage
  }

  get limit() {
    return this.perPage
  }

  get sort() {
    return this.sortField && this.sortDirection
      ? { [this.sortField]: this.sortDirection }
      : undefined
  }

  get search() {
    const searchString = this.q
    return searchString ? { $text: { $search: searchString } } : {}
  }

  getBaseQuery(): object {
    return this.search
  }

  getPageCount(count: number) {
    return Math.ceil(count / this.perPage)
  }

  createFindOptions() {
    return {
      skip: this.skip,
      limit: this.limit,
      sort: this.sort,
      lean: true,
    }
  }

  createResponse<T = any>(data: T[], count: number) {
    return {
      data,
      metadata: {
        page: this.page,
        perPage: this.perPage,
        pageCount: this.getPageCount(count),
        totalCount: count,
      },
    }
  }
}
