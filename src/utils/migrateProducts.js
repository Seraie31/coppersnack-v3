import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

export async function migrateProductsToDoubleStock() {
  try {
    console.log('🔄 Début de la migration des produits...')
    
    const snapshot = await getDocs(collection(db, 'products'))
    
    for (const productDoc of snapshot.docs) {
      const data = productDoc.data()
      const currentStock = data.stock || 0
      
      await updateDoc(doc(db, 'products', productDoc.id), {
        stockFrigo: currentStock,  // Stock actuel devient stock frigo
        stockReserve: 0            // Stock réserve à 0
      })
      
      console.log(`✅ Produit "${data.name}" migré`)
    }
    
    console.log('🎉 Migration terminée !')
    return true
  } catch (error) {
    console.error('❌ Erreur migration:', error)
    return false
  }
}
