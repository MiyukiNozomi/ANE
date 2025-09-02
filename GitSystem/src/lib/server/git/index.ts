import bridge from "./bridge";
import { createNewRepository, getPhysicalProjectLocation } from "./fs";
import { handleGitRequest } from "./gitHttp";

const Git = {
  bridge,
  createNewRepository,
  getPhysicalProjectLocation,
  handleGitRequest,
};

export default Git;
