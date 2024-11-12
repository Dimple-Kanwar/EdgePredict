import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RatingModule = buildModule("RatingModule", (m) => {
  const ratingContract = m.contract("RatingContract", []);

  return { ratingContract };
});

export default RatingModule;
