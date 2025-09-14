import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function SimpleTest() {
  return (
    <div className="p-4 bg-background min-h-screen">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-accent">NSS App Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you can see this, the basic components are working!
          </p>
          <div className="flex gap-2">
            <Button variant="default">Primary</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <div className="flex gap-2">
            <Badge>Success</Badge>
            <Badge variant="outline">Test</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}