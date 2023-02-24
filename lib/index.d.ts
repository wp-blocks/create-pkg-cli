export type Context = {
  cwd: string;
  template: string;
  root: boolean;
  name: string;
  scope?: string;
  repo?: string;
  author?: {
    email?: string;
    name?: string;
    url?: string;
    [index: string]: any;
  };
  [index: string]: any;
};
