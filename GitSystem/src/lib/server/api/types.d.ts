export type GITAPIErrors =
  | "ERR_CLONE_FAILED"
  | "ERR_NO_REPOSITORY_TREE"
  | "ERR_UPLOAD_FAILED";

export type GitAPIResponse<T> = {
  data?: T;
  error?: GITAPIErrors;
};

export type GitAPIError = GitAPIResponse<undefined>;
export type GitAPIOk = GitAPIResponse<boolean>;
