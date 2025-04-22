import { Suspense } from 'react'
import BorrowClient from './BorrowClient'

export default function BorrowPage() {
  return (
    
      <Suspense fallback={<div>Loading...</div>}>
        <BorrowClient />
      </Suspense>
      
    
  )
}