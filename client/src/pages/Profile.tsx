import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();

  const handleNotImplemented = () => {
    toast({
      title: "기능 준비 중",
      description: "이 기능은 아직 개발 중입니다.",
    });
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-emerald-600">내 정보</h1>
        </div>
      </header>

      {/* Profile Content */}
      <div className="container mx-auto px-4 py-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>설정</CardTitle>
            <CardDescription>앱 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-consumption">자동 소비 기능</Label>
                <p className="text-sm text-muted-foreground">
                  설정된 음식이 매일 자동으로 소비됩니다.
                </p>
              </div>
              <Switch id="auto-consumption" defaultChecked={true} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="expiration-alerts">유통기한 알림</Label>
                <p className="text-sm text-muted-foreground">
                  유통기한이 임박하면 알림을 받습니다.
                </p>
              </div>
              <Switch id="expiration-alerts" defaultChecked={true} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-shopping">자동 장바구니 추가</Label>
                <p className="text-sm text-muted-foreground">
                  음식이 소진되면 자동으로 장바구니에 추가됩니다.
                </p>
              </div>
              <Switch id="auto-shopping" defaultChecked={true} />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>앱 정보</CardTitle>
            <CardDescription>앱에 대한 정보를 확인합니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h3 className="text-sm font-medium">버전</h3>
              <p className="text-sm text-muted-foreground">1.0.0</p>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium">개발자</h3>
              <p className="text-sm text-muted-foreground">남은 음식 확인 프로젝트 팀</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleNotImplemented}>
              피드백 보내기
            </Button>
          </CardFooter>
        </Card>

        <Button 
          variant="destructive" 
          className="w-full" 
          onClick={handleNotImplemented}
        >
          로그아웃
        </Button>
      </div>
    </div>
  );
};

export default Profile;
