import { firestore } from "firebase-admin";

type Firestore = firestore.Firestore;

export const getRewardData = async (
  epochString: string,
  id: string,
  db: Firestore
) => {
  const documentRef = db.doc(`${epochString}/${id}`);
  const document: any = await documentRef.get();
  if (document.exists) {
    return document.data();
  } else {
    return undefined;
  }
};
