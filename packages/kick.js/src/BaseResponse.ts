export type BaseResponse<T> = {
  data: T;
  message: string;
};

export type BaseResponseWithPagination<T> = BaseResponse<T> & {
  pagination: {
    next_cursor: string;
  };
};
