import { db } from "lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";
import Cors from "cors";
import { createRouter } from "next-connect";
import { getRewardData } from "lib/database";

const router = createRouter<NextApiRequest, NextApiResponse>();
router.use(Cors({ credentials: false, origin: true }));

router.get(async (req, res) => {
  try {
    const query = req.query;
    const { address, epoch } = query;
    const rewardInfo = await getRewardData(
      epoch as string,
      address as string,
      db
    );
    if (rewardInfo) {
      return res.status(200).json({ rewardInfo });
    }
    return res
      .status(400)
      .json({ message: "An unexpected error occurred", rewardInfo: null });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An unexpected error occurred", rewardInfo: null });
  }
});

export default router.handler({
  onError: (err, req, res) => {
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Route not found");
  },
});
