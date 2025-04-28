#include <CoreGraphics/CoreGraphics.h>
#include <ImageIO/ImageIO.h>
#include <CoreFoundation/CoreFoundation.h>
#include <iostream>
#include <sstream>

void SaveDisplayThumbnail(CGDirectDisplayID displayID, const std::string &filename)
{
    CGImageRef image = CGDisplayCreateImage(displayID);
    if (!image)
    {
        std::cerr << "디스플레이 이미지를 생성하는 데 실패했습니다." << std::endl;
        return;
    }

    CFStringRef path = CFStringCreateWithCString(NULL, filename.c_str(), kCFStringEncodingUTF8);
    CFURLRef url = CFURLCreateWithFileSystemPath(NULL, path, kCFURLPOSIXPathStyle, false);
    CFStringRef type = CFSTR("public.jpeg");

    CGImageDestinationRef dest = CGImageDestinationCreateWithURL(url, type, 1, NULL);
    if (!dest)
    {
        std::cerr << "이미지 저장을 위한 대상 생성에 실패했습니다." << std::endl;
        CFRelease(image);
        CFRelease(url);
        CFRelease(path);
        return;
    }

    CGImageDestinationAddImage(dest, image, NULL);
    if (!CGImageDestinationFinalize(dest))
    {
        std::cerr << "이미지 저장에 실패했습니다." << std::endl;
    }

    CFRelease(dest);
    CFRelease(image);
    CFRelease(url);
    CFRelease(path);
}

int main()
{
    constexpr uint32_t maxDisplays = 16;
    CGDirectDisplayID displays[maxDisplays];
    uint32_t displayCount = 0;

    CGError err = CGGetOnlineDisplayList(maxDisplays, displays, &displayCount);
    if (err != kCGErrorSuccess)
    {
        std::cerr << "디스플레이 목록을 가져오는 데 실패했습니다." << std::endl;
        return -1;
    }

    for (uint32_t i = 0; i < displayCount; ++i)
    {
        std::ostringstream filename;
        filename << "/tmp/display_" << displays[i] << ".jpg";
        SaveDisplayThumbnail(displays[i], filename.str());
        std::cout << "디스플레이 " << displays[i] << "의 썸네일을 저장했습니다: " << filename.str() << std::endl;
    }

    return 0;
}