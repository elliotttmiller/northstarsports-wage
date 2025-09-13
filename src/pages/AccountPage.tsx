import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function AccountPage() {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="p-4 border-b border-border bg-card">
        <h2 className="text-xl font-bold text-card-foreground">Account Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="text-lg">NS</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">NorthStar User</div>
                <div className="text-sm text-muted-foreground">Member since 2024</div>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>
            </div>
            
            <Button className="w-full md:w-auto">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">$0.00</div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Deposit
              </Button>
              <Button variant="outline" className="flex-1">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Betting Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultStake">Default Stake Amount</Label>
              <Input id="defaultStake" type="number" placeholder="25.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oddsFormat">Odds Format</Label>
              <Input id="oddsFormat" placeholder="American (-110, +120)" disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}