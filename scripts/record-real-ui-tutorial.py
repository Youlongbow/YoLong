import pathlib, tempfile, threading, http.server, subprocess, shutil, os, time, asyncio, json
import edge_tts
from functools import partial
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
out=pathlib.Path("tutorial-output").resolve(); out.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory() as folder:
    work=pathlib.Path(folder)
    voice_lines=[
        "欢迎使用 Raven 安防设计平台。下面演示如何快速创建一个场景。",
        "首先导入地图底图。选择一张俯视地图截图，这里使用示例平面图。",
        "在底图设置中输入图片对应的真实宽度。也可以用尺子测量两个已知位置，再输入实际距离完成校准。",
        "在左侧模型库搜索建筑，点击模型，即可将它添加到画布中。",
        "选中建筑后，在右侧对象属性中输入宽度、深度和高度。按 Tab 键或回车确认。",
        "按 F 二键进入自由变换模式。拖动边缘控制点调整尺寸，按回车退出。",
        "按住鼠标右键拖动即可平移。在空白处按住左键拖动进行框选，滚轮用于缩放。",
        "切换到三维视图，点击 GPU 预览，查看模型的立体效果。",
        "GPU 预览中仍可保留地图底图。",
        "当前浏览器采用普通三维预览。",
        "完成后点击保存，将场景保存在浏览器中。也可以导出 JSON 文件，便于备份和再次编辑。"
    ]
    clips=[]; voice_engine="edge-tts zh-CN-YunxiNeural"
    def command(*args):
        return subprocess.run(list(map(str,args)),check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    async def synth_all():
        for i,line in enumerate(voice_lines):
            path=work/f"speech-{i}.mp3"
            await asyncio.wait_for(edge_tts.Communicate(line,"zh-CN-YunxiNeural",rate="+5%").save(str(path)),timeout=22)
    try:
        asyncio.run(synth_all())
    except Exception as e:
        print("Neural speech unavailable:",repr(e))
        voice_engine="espeak-ng Mandarin (local synthesized voice)"
        for i,line in enumerate(voice_lines):
            wav=work/f"speech-{i}.wav"
            command("espeak-ng","-v","cmn","-s","175","-w",wav,line)
            command("ffmpeg","-y","-i",wav,"-c:a","libmp3lame","-q:a","3",work/f"speech-{i}.mp3")
    for i in range(len(voice_lines)):
        path=work/f"speech-{i}.mp3"
        duration=float(command("ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",path).stdout.strip())
        if not duration>0:raise RuntimeError("Speech segment is empty")
        clips.append((path,duration))
    print("Narration engine:",voice_engine)
    cues=[]
    shutil.copyfile("assets/security-lab.js",work/"security-lab.js")
    (work/"index.html").write_text("""<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RAVEN</title><style>body{margin:0;background:#10171b;font:14px Arial,"Noto Sans CJK SC",sans-serif;color:#e4e8e8}.shell{padding:16px}.rd-tool input,.rd-tool select{color:inherit;background:#17262b;border:1px solid #465961;border-radius:4px}</style><body><script type="module">import {labMarkup,initLab} from './security-lab.js';document.body.innerHTML=labMarkup('zh');initLab('zh');</script></body></html>""",encoding="utf-8")
    im=Image.new("RGB",(1200,800),"#78836f"); d=ImageDraw.Draw(im)
    d.rectangle((0,355,1200,445),fill="#a0a3a0");d.rectangle((540,0,640,800),fill="#a0a3a0")
    for x,y,X,Y in [(105,100,350,245),(765,105,1030,270),(130,535,370,690)]:
        d.rectangle((x+9,y+9,X+9,Y+9),fill="#555c54");d.rectangle((x,y,X,Y),fill="#c0c3bf",outline="#d9dbd7",width=5)
    d.line((95,745,395,745),fill="white",width=7);d.line((95,735,95,755),fill="white",width=4);d.line((395,735,395,755),fill="white",width=4);d.text((105,715),"20 m - fictional sample",fill="white");im.save(work/"reference.png")
    server=http.server.ThreadingHTTPServer(("127.0.0.1",0),partial(http.server.SimpleHTTPRequestHandler,directory=folder))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,args=["--enable-webgl","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
        ctx=browser.new_context(viewport={"width":1600,"height":1000},device_scale_factor=1,record_video_dir=str(work),record_video_size={"width":1600,"height":1000})
        epoch=time.monotonic();page=ctx.new_page();page.set_default_timeout(25000);page.on("pageerror",lambda e:print("Page error:",e))
        try:
            page.goto(f"http://127.0.0.1:{server.server_port}/",wait_until="domcontentloaded")
            page.locator('#rd-palette [data-add="building"]').wait_for(state="attached")
            page.evaluate("""() => {const s=document.createElement('style');s.textContent='#record-ribbon{position:fixed;bottom:10px;left:24px;right:24px;z-index:20000;padding:12px 18px;background:#101b22ef;border:1px solid #78909c;border-radius:7px;color:#fff;font:600 19px sans-serif;pointer-events:none;text-align:center}#record-cursor{position:fixed;z-index:20001;pointer-events:none;width:22px;height:22px;border:2px solid #f2c46a;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 6px #111}';document.head.append(s);const c=document.createElement('div');c.id='record-cursor';document.body.append(c);const b=document.createElement('div');b.id='record-ribbon';document.body.append(b);document.addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'});document.addEventListener('mousedown',()=>c.style.background='#f2c46a55');document.addEventListener('mouseup',()=>c.style.background='transparent');}""")
            def say(t,i):
                if cues:
                    prev,offset=cues[-1]
                    remaining=offset+clips[prev][1]+0.25-(time.monotonic()-epoch)
                    if remaining>0:page.wait_for_timeout(int(remaining*1000))
                page.evaluate('(t)=>document.querySelector("#record-ribbon").textContent=t',t)
                cues.append((i,time.monotonic()-epoch))
                page.wait_for_timeout(1200)
            def click(s):
                el=page.locator(s).first;el.scroll_into_view_if_needed();el.click();page.wait_for_timeout(350)
            def field(s,v):
                el=page.locator(s).first;el.scroll_into_view_if_needed();el.fill(str(v));el.press("Tab");page.wait_for_timeout(400)
            def point(x,y):
                return page.locator("#rd-canvas").evaluate("(s,p)=>{const a=s.createSVGPoint();a.x=p[0];a.y=p[1];const b=a.matrixTransform(s.getScreenCTM());return [b.x,b.y]}",[x,y])
            def drag(a,b,button="left"):
                page.mouse.move(*a);page.mouse.down(button=button);page.mouse.move(*b,steps=24);page.mouse.up(button=button);page.wait_for_timeout(650)
            click('[data-cmd="workspace-expand"]');click('[data-cmd="new"]')
            say("RAVEN | 快速入门 · 真实编辑器界面",0)
            say("01 导入地图底图｜使用虚构示例平面图",1)
            page.locator("#rd-underlay-file").set_input_files(str(work/"reference.png"))
            page.wait_for_function('document.querySelector("#rd-underlay-fields").disabled===false')
            say("02 比例校准｜输入底图实际宽度，也可使用尺子两点校准",2)
            field("#rd-underlay-width",80);click('[data-cmd="underlay-fit"]')
            say("03 搜索建筑｜在组件库添加模型",3)
            page.locator("#rd-search").fill("building");click('#rd-palette [data-add="building"]')
            say("04 对象属性｜输入宽度、深度和高度，Tab 确认",4)
            for k,v in [("w",12),("d",8),("h",5)]:field(f'#rd-inspector [data-prop="{k}"]',v)
            say("05 自由变换｜选中模型，F2 后拖动边缘控制点",5)
            page.locator("#rd-canvas").focus();page.keyboard.press("F2")
            h=page.locator('#rd-canvas [data-transform-handle="1,0"]');h.wait_for(state="visible");b=h.bounding_box();p=(b["x"]+b["width"]/2,b["y"]+b["height"]/2);drag(p,(p[0]+65,p[1]));page.keyboard.press("Enter")
            say("06 右键拖动平移｜空白处左键拖动框选｜滚轮缩放",6)
            drag(point(330,240),point(410,275),"right");drag(point(100,100),point(690,450));page.mouse.move(*point(400,260));page.mouse.wheel(0,-100);page.wait_for_timeout(700)
            say("07 三维视角｜GPU 预览",7)
            click('[data-view="iso"]')
            if page.locator('[data-cmd="gpu"]').get_attribute("aria-pressed")!="true":click('[data-cmd="gpu"]')
            if page.locator('[data-cmd="gpu"]').get_attribute("aria-pressed")=="true":say("GPU 已启用｜保留地图底图",8)
            else:say("当前浏览器使用普通三维预览",9)
            say("08 保存场景｜本地保存或导出 JSON",10)
            click('[data-cmd="save"]')
            prev,offset=cues[-1]
            page.wait_for_timeout(max(1800,int((offset+clips[prev][1]+0.8-(time.monotonic()-epoch))*1000)))
            page.screenshot(path=str(out/"preview.png"))
        except Exception:
            page.screenshot(path=str(out/"error.png"))
            raise
        finally:
            video=page.video;ctx.close();raw=pathlib.Path(video.path());browser.close()
            if len(cues)<9:raise RuntimeError("Incomplete tutorial narration")
            args=["ffmpeg","-y","-i",str(raw)]
            filters=[]
            for j,(i,offset) in enumerate(cues,1):
                args+=["-i",str(clips[i][0])]
                delay=max(0,int(offset*1000))
                filters.append(f"[{j}:a]aresample=48000,adelay={delay}:all=1[a{j}]")
            filters.append("".join(f"[a{j}]" for j in range(1,len(cues)+1))+f"amix=inputs={len(cues)}:normalize=0,apad[audio]")
            args+=["-filter_complex",";".join(filters),"-map","0:v:0","-map","[audio]","-c:v","libx264","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","128k","-shortest","-movflags","+faststart",str(out/"RAVEN_Real_UI_CN_Narrated.mp4")]
            subprocess.run(args,check=True)
            probe=json.loads(command("ffprobe","-v","error","-show_streams","-show_format","-of","json",out/"RAVEN_Real_UI_CN_Narrated.mp4").stdout)
            if not any(st.get("codec_type")=="audio" for st in probe["streams"]):raise RuntimeError("Audio track missing")
            (out/"recording-info.json").write_text(json.dumps({"voice_engine":voice_engine,"duration_seconds":float(probe["format"]["duration"]),"narration_cues":[{"start":round(offset,3),"text":voice_lines[i]} for i,offset in cues],"streams":[{"type":st["codec_type"],"codec":st["codec_name"]} for st in probe["streams"]]},ensure_ascii=False,indent=2),encoding="utf-8")
            print("Verified narrated MP4:",probe["format"]["duration"],"seconds;",voice_engine)
    server.shutdown()
