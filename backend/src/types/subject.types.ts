export interface IResourceLink {
  label: string;
  url: string;
}

interface ITopic {
  name: string;
  description: string;
  resourceLinks?: IResourceLink[];
  finished?: boolean;
  finishedAt?: Date | null;
}
interface IChapter {
  name: string;
  description: string;
  topics: ITopic[];
  finished?: boolean;
  finishedAt?: Date | null;
}
interface ISubject {
  name: string;
  description: string;
  resourceLinks?: IResourceLink[];
  chapters: IChapter[];
  finished?: boolean;
  finishedAt?: Date | null;
}

export { ITopic, IChapter, ISubject };
