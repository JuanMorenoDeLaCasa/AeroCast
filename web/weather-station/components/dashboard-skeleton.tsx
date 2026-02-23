import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6">
      {/* Temperatura y Humedad lado a lado */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full">
        {/* Temperature Gauge Skeleton */}
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle>Temperatura Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-[250px] w-full max-w-[250px] rounded-full" />
          </CardContent>
        </Card>

        {/* Humidity Gauge Skeleton */}
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle>Humedad Actual</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Skeleton className="h-[250px] w-full max-w-[250px] rounded-full" />
          </CardContent>
        </Card>
      </div>

      {/* Webcam Skeleton grande debajo */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle>Cámara en Vivo</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video w-full h-[400px]" />
        </CardContent>
      </Card>

      {/* Charts Skeleton */}
      <Card className="w-full">
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
