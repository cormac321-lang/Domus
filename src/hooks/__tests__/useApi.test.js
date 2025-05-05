import { renderHook, act } from '@testing-library/react';
import { useApi } from '../useApi';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { vi } from 'vitest';

describe('useApi', () => {
  const mockCollection = 'test-collection';
  const mockData = { name: 'Test Item' };
  const mockId = 'test-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a document', async () => {
    const { result } = renderHook(() => useApi(mockCollection));

    addDoc.mockResolvedValueOnce({ id: mockId });

    await act(async () => {
      const id = await result.current.create(mockData);
      expect(id).toBe(mockId);
    });

    expect(addDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...mockData,
        createdAt: expect.any(String),
      })
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update a document', async () => {
    const { result } = renderHook(() => useApi(mockCollection));

    updateDoc.mockResolvedValueOnce();

    await act(async () => {
      await result.current.update(mockId, mockData);
    });

    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        ...mockData,
        updatedAt: expect.any(String),
      })
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should delete a document', async () => {
    const { result } = renderHook(() => useApi(mockCollection));

    deleteDoc.mockResolvedValueOnce();

    await act(async () => {
      await result.current.remove(mockId);
    });

    expect(deleteDoc).toHaveBeenCalledWith(expect.anything());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors', async () => {
    const { result } = renderHook(() => useApi(mockCollection));
    const mockError = new Error('Test error');

    addDoc.mockRejectedValueOnce(mockError);

    await act(async () => {
      try {
        await result.current.create(mockData);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(mockError.message);
  });
}); 