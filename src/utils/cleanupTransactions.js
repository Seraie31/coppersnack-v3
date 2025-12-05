import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase/config'

export async function cleanupAllUserTransactions(userId) {
  try {
    console.log(`🧹 Nettoyage des transactions pour l'utilisateur ${userId}...`)
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const allTransactions = snapshot.docs
    
    if (allTransactions.length > 10) {
      const transactionsToDelete = allTransactions.slice(10)
      
      console.log(`🗑️ Suppression de ${transactionsToDelete.length} transactions...`)
      
      for (const transactionDoc of transactionsToDelete) {
        await deleteDoc(doc(db, 'transactions', transactionDoc.id))
      }
      
      console.log(`✅ ${transactionsToDelete.length} transactions supprimées !`)
    } else {
      console.log(`✅ Aucune transaction à supprimer (total: ${allTransactions.length})`)
    }
  } catch (error) {
    console.error('Erreur nettoyage:', error)
  }
}
