
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    writeBatch,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

// --- API Functions ---

export const api = {
    
    // --- AUTHENTICATION ---
    
    login: async (email: string, password: string) => {
        try {
            // 1. Login ke Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // 2. Ambil data role dari Firestore (koleksi 'users')
            // Kita asumsikan dokumen user disimpan dengan ID = UID user
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            let role = 'user';
            if (userDocSnap.exists()) {
                role = userDocSnap.data().role || 'user';
            }

            // 3. Kembalikan objek User sesuai format aplikasi
            return {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                password: '***', // Jangan simpan password asli di state
                role: role
            };
        } catch (error: any) {
            console.error("Login Error:", error);
            throw new Error(getFriendlyErrorMessage(error.code));
        }
    },

    register: async (email: string, password: string) => {
        try {
            // 1. Buat user di Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;
            const role = email === 'admin@bacol.dev' ? 'admin' : 'user';

            // 2. Simpan detail user ke Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                email: email,
                role: role,
                createdAt: new Date().toISOString()
            });

            return {
                id: firebaseUser.uid,
                email: email,
                password: '***',
                role: role
            };
        } catch (error: any) {
            console.error("Register Error:", error);
            throw new Error(getFriendlyErrorMessage(error.code));
        }
    },

    logout: async () => {
        await signOut(auth);
    },

    // --- DATA CRUD (FIRESTORE) ---

    fetchCollection: async (collectionName: string, userId: string) => {
        try {
            // Query data hanya milik user yang sedang login
            const q = query(collection(db, collectionName), where("userId", "==", userId));
            const querySnapshot = await getDocs(q);
            
            // Map dokumen Firestore ke array object biasa
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error(`Error fetching ${collectionName}:`, error);
            throw new Error(`Gagal mengambil data ${collectionName}`);
        }
    },

    createItem: async (collectionName: string, item: any) => {
        try {
            // Hapus ID jika ada (biarkan Firestore generate atau gunakan logic uuid jika perlu konsistensi)
            // Di aplikasi ini, ID sering di-generate di frontend (uuidv4) untuk optimis UI,
            // tapi Firestore punya ID sendiri. 
            // Strategi: Jika item punya ID, gunakan setDoc. Jika tidak, gunakan addDoc.
            
            // Namun, untuk simplisitas migrasi, kita biarkan Firestore generate ID dokumen,
            // lalu kita update field 'id' di dalam dokumen agar sama (atau biarkan frontend handle).
            // Tapi wait, frontend `useMockData` sering mengirim `id` (uuid).
            
            const { id, ...dataToSave } = item;
            
            // Jika item sudah membawa ID (dari frontend UUID), kita gunakan itu sebagai ID dokumen
            if (id) {
                await setDoc(doc(db, collectionName, id), dataToSave);
                return { id, ...dataToSave };
            } else {
                // Jika tidak, biarkan Firestore generate
                const docRef = await addDoc(collection(db, collectionName), dataToSave);
                // Update dokumen agar field 'id' di dalam data sama dengan ID dokumen (opsional, tapi bagus untuk konsistensi)
                await updateDoc(docRef, { id: docRef.id });
                return { id: docRef.id, ...dataToSave };
            }
        } catch (error) {
            console.error(`Error creating item in ${collectionName}:`, error);
            throw error;
        }
    },

    updateItem: async (collectionName: string, item: any) => {
        try {
            if (!item.id) throw new Error("ID diperlukan untuk update");
            const docRef = doc(db, collectionName, item.id);
            await updateDoc(docRef, item);
            return item;
        } catch (error) {
            console.error(`Error updating item in ${collectionName}:`, error);
            throw error;
        }
    },

    deleteItem: async (collectionName: string, id: string) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
            return id;
        } catch (error) {
            console.error(`Error deleting item in ${collectionName}:`, error);
            throw error;
        }
    },
    
    hardReset: async (userId: string) => {
        try {
            const collections = ["bku", "bkp", "peminjam", "setoran", "manual_payments", "reconciliation"];
            const batch = writeBatch(db);
            let operationCount = 0;

            // Firestore batch limit is 500. 
            // Implementasi naif: loop fetch lalu delete. 
            // Untuk production data besar, ini harus di-chunk.
            
            for (const colName of collections) {
                const q = query(collection(db, colName), where("userId", "==", userId));
                const snapshot = await getDocs(q);
                
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                    operationCount++;
                });
            }

            if (operationCount > 0) {
                await batch.commit();
            }
        } catch (error) {
             console.error("Error performing hard reset:", error);
             throw error;
        }
    }
};

// Helper untuk pesan error Firebase yang user-friendly
const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
        case 'auth/invalid-credential':
            return "Email atau kata sandi salah.";
        case 'auth/user-not-found':
            return "Akun tidak ditemukan.";
        case 'auth/wrong-password':
            return "Kata sandi salah.";
        case 'auth/email-already-in-use':
            return "Email sudah terdaftar. Silakan login.";
        case 'auth/weak-password':
            return "Kata sandi terlalu lemah (min. 6 karakter).";
        case 'auth/invalid-email':
            return "Format email tidak valid.";
        default:
            return "Terjadi kesalahan pada sistem (" + errorCode + ")";
    }
};
