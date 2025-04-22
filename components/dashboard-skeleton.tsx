import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Temperature Gauge Skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Temperatura Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </CardContent>
        </Card>

        {/* Humidity Gauge Skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Humedad Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </CardContent>
        </Card>

        {/* Webcam Skeleton */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>Cámara en Vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Históricos</CardTitle>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <Tabs defaultValue="3h">
              <TabsList>
                <TabsTrigger value="3h">3h</TabsTrigger>
                <TabsTrigger value="6h">6h</TabsTrigger>
                <TabsTrigger value="12h">12h</TabsTrigger>
                <TabsTrigger value="1d">1 día</TabsTrigger>
                <TabsTrigger value="7d">7 días</TabsTrigger>
                <TabsTrigger value="custom">Personalizado</TabsTrigger>
              </TabsList>
            </Tabs>
            <Skeleton className="h-10 w-[250px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-medium">Temperatura</h3>
              <Skeleton className="h-[300px] w-full" />
            </div>
            <div>
              <h3 className="mb-4 text-lg font-medium">Humedad</h3>
              <Skeleton className="h-[300px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

