import bridge from "./bridge";
import { getPhysicalProjectLocation } from "./fs";
import { handleGitRequest } from "./gitHttp";

const Git = {
  bridge,
  getPhysicalProjectLocation,
  handleGitRequest,
};

export default Git;
