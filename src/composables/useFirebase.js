import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export const useFirebase = () => {
  
  // Utilisateurs
  const createUserProfile = async (uid, userData) => {
    await setDoc(doc(db, 'users', uid), {
      ...userData,
      balance: 0,
      role: 'user',
      createdAt: serverTimestamp()
    })
  }

  const getUserProfile = async (uid) => {
    const docSnap = await getDoc(doc(db, 'users', uid))
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null
  }

  const updateUserBalance = async (uid, amount) => {
    await updateDoc(doc(db, 'users', uid), {
      balance: increment(amount)
    })
  }

  // Produits
  const getProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const updateProductStock = async (productId, stockType, amount) => {
    await updateDoc(doc(db, 'products', productId), {
      [stockType]: increment(amount)
    })
  }

  // Transactions
  const createTransaction = async (transactionData) => {
    return await runTransaction(db, async (transaction) => {
      const productRef = doc(db, 'products', transactionData.productId)
      const productDoc = await transaction.get(productRef)
      
      if (!productDoc.exists()) {
        throw new Error("Produit introuvable")
      }

      const product = productDoc.data()
      
      if (product.stockFrigo < 1) {
        throw new Error("Stock insuffisant")
      }

      transaction.update(productRef, {
        stockFrigo: increment(-1)
      })

      const userRef = doc(db, 'users', transactionData.userId)
      transaction.update(userRef, {
        balance: increment(-transactionData.amount)
      })

      const transactionRef = doc(collection(db, 'transactions'))
      transaction.set(transactionRef, {
        ...transactionData,
        createdAt: serverTimestamp()
      })

      return transactionRef.id
    })
  }

  const getUserTransactions = async (userId) => {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const createRecharge = async (userId, amount) => {
    await addDoc(collection(db, 'recharges'), {
      userId,
      amount,
      createdAt: serverTimestamp()
    })
    await updateUserBalance(userId, amount)
  }

  const getAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'))
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  const getAllTransactions = async () => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }

  return {
    createUserProfile,
    getUserProfile,
    updateUserBalance,
    getProducts,
    updateProductStock,
    createTransaction,
    getUserTransactions,
    createRecharge,
    getAllUsers,
    getAllTransactions
  }
}
