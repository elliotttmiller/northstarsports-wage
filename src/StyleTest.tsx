import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StyleTest() {
  return (
    <div className="p-4 space-y-4 bg-background text-foreground min-h-screen">
      <h1 className="text-2xl font-bold text-foreground">Style Test</h1>
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Theme Test Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">This should display with proper theme colors.</p>
          <div className="space-x-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-primary rounded text-primary-foreground">
          Primary color background
        </div>
        <div className="p-4 bg-secondary rounded text-secondary-foreground">
          Secondary color background  
        </div>
        <div className="p-4 bg-accent rounded text-accent-foreground">
          Accent color background
        </div>
        <div className="p-4 bg-muted rounded text-muted-foreground">
          Muted color background
        </div>
      </div>
    </div>
  )
}