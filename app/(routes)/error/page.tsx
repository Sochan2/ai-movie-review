'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle>Error</CardTitle>
          </div>
          <CardDescription>
            Something went wrong
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {error || 'An unexpected error occurred. Please try again.'}
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.history.back()} variant="outline" className="w-full">
            Go Back
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}