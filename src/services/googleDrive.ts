import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

export const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("تعذر الحصول على رمز الوصول من حساب Google");
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export interface DriveFileItem {
  id: string;
  name: string;
  webViewLink?: string;
  createdTime?: string;
  mimeType?: string;
  description?: string;
}

const FOLDER_NAME = "منصة الهندسة البيداغوجية - الرياضيات (Math Platform)";

export async function findOrCreatePedagogicalFolder(
  accessToken: string
): Promise<string> {
  const query = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${FOLDER_NAME}' and trashed=false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (searchRes.status === 401 || searchRes.status === 403) {
    cachedAccessToken = null;
    throw new Error("AUTH_REQUIRED");
  }

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
      description:
        "مجلد خاص بحفظ الفروض المحروسة والمنزلية وسلاسل التمارين والجذاذات التربوية لمادة الرياضيات",
    }),
  });

  if (!createRes.ok) {
    throw new Error("تعذر إنشاء مجلد المنصة في Google Drive");
  }

  const folderData = await createRes.json();
  return folderData.id;
}

export async function uploadDocumentToDrive(params: {
  accessToken: string;
  fileName: string;
  content: string;
  mimeType?: string;
  description?: string;
}): Promise<DriveFileItem> {
  const {
    accessToken,
    fileName,
    content,
    mimeType = "text/plain;charset=utf-8",
    description = "وثيقة بيداغوجية مولدة عبر منصة الهندسة البيداغوجية للرياضيات",
  } = params;

  const folderId = await findOrCreatePedagogicalFolder(accessToken);

  const metadata = {
    name: fileName,
    mimeType: "text/plain",
    parents: [folderId],
    description,
  };

  const boundary = "-------314159265358979323846";
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${mimeType}\r\n\r\n` +
    content +
    closeDelim;

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,createdTime,description",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (uploadRes.status === 401 || uploadRes.status === 403) {
    cachedAccessToken = null;
    throw new Error("AUTH_REQUIRED");
  }

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`فشل رفع الملف إلى Google Drive: ${errText}`);
  }

  return await uploadRes.json();
}

export async function listSavedDriveDocuments(
  accessToken: string
): Promise<DriveFileItem[]> {
  const query = encodeURIComponent(
    `mimeType != 'application/vnd.google-apps.folder' and trashed = false`
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&pageSize=20&orderBy=createdTime desc&fields=files(id,name,webViewLink,createdTime,mimeType,description)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error("AUTH_REQUIRED");
  }

  if (!res.ok) {
    throw new Error("تعذر جلب قائمة الملفات من Google Drive");
  }

  const data = await res.json();
  return data.files || [];
}

export async function deleteDriveDocument(
  accessToken: string,
  fileId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (res.status === 401 || res.status === 403) {
    cachedAccessToken = null;
    throw new Error("AUTH_REQUIRED");
  }

  if (!res.ok) {
    throw new Error("تعذر حذف الملف من Google Drive");
  }
}
