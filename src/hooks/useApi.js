import { useState, useCallback } from 'react';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export const useApi = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = useCallback(async (data) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const update = useCallback(async (id, data) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  const remove = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  return {
    loading,
    error,
    create,
    update,
    remove,
  };
}; 