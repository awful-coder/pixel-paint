/*
 * wait a sec...
 * i was told this was javascript...
 * DAMMIT MICROSOFT
 * i cant even use the Array constructor
 * or the void operator
 * or the spread operator
 * WHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 * won't even let me use for...in to iterate through arrays
 */

enum Colors{
    Transparent = 0, White, Red, Pink, Orange, Yellow, Aqua/*Bedwars player here xD*/,
    Green, Blue, LightBlue, Violet, Grey /*ish*/, Purple, Beige, Brown, Black
};

let editingImage = image.create(
    Math.round(game.askForNumber("Please enter width:",3)), 
    Math.round(game.askForNumber("Please enter height:",3)));
editingImage.fill(0);

let canDraw = false;

function updateCanDraw(){
    if(!controller.A.isPressed()){
        canDraw = true;
    }
}

let scale = 8;

scene.setBackgroundColor(0);

class Canvas{
    static BgImg = image.create(editingImage.width,editingImage.height);
    static Background = sprites.create(Canvas.BgImg);
    static Canvas = sprites.create(editingImage);

    static Checkerboard(im : Image, replace : Colors[], 
    c1 = Colors.Grey, c2 = Colors.Beige){
        for(let i = 0; i < im.width*im.height; i++){
            let x = i%im.width;
            let y = Math.floor(i/im.width);
            if(replace.indexOf(im.getPixel(x,y)) >= 0){
                im.setPixel(
                    x,y,
                    (i+(
                        !(im.width%2) && // yes readability my primary concern
                        Math.floor(i/im.width)%2 ?
                        1:0
                    )) % 2 ?
                    c1 : c2
                );
            }
        }
    }
    
    static Init(){
        this.Canvas.setPosition(scene.screenWidth()/2,scene.screenHeight()/2);
        this.Background.setPosition(scene.screenWidth()/2,scene.screenHeight()/2);

        this.Checkerboard(this.BgImg,[Colors.Transparent]);
    }

    static Update(){
        this.Canvas.setImage(
            ImageRenderer.Get(editingImage,scale)
        );
        this.Background.setImage(
            ImageRenderer.Get(this.BgImg,scale)
        );
    }
}

Canvas.Init();

class Mouse{
    static x = scene.screenWidth()/2;
    static y = scene.screenHeight()/2;
    static PointerImage = img`
        . . . f . . .
        . . . f . . .
        . . . . . . .
        f f . . . f f
        . . . . . . .
        . . . f . . .
        . . . f . . .
    `;
    static readonly Pointer = sprites.create(Mouse.PointerImage);

    static Update(){
        this.PointerImage.fillRect(2,2,3,3,Palette.CurrentColor);
        this.PointerImage.setPixel(3,3,Colors.Transparent);

        this.x += controller.dx(50);
        this.y += controller.dy(50);
        this.x = Math.constrain(this.x, 
        Canvas.Canvas.left+1, 
        Canvas.Canvas.left+Canvas.Canvas.width);
        this.y = Math.constrain(this.y, 
        Canvas.Canvas.top+1, 
        Canvas.Canvas.top+Canvas.Canvas.height);

        this.Pointer.setPosition(this.x, this.y);

        scene.centerCameraAt(Math.round(this.x), Math.round(this.y));

        if(controller.A.isPressed() && canDraw) draw();
    }
}

class ImageRenderer{
    static Get(im: Image,size = 1){
        let r = image.create(im.width*size, im.height*size);

        for(let y = 0; y < im.height; y++){
            for(let x = 0; x < im.width; x++){
                r.fillRect(x*size, y*size, x*size+size, y*size+size, im.getPixel(x,y));
            }
        }
        return r;
    }
}

class Tool{
    // static Icon : Sprite;
    Use(x:number,y:number) : void  {}
}

class PaintBrush extends Tool{
    Draw(x:number,y:number,c:number){
        editingImage.setPixel(x,y,c);
    }

    Use(x:number, y:number){
        this.Draw(x,y,Palette.CurrentColor);
    }
}

let currentTool : any = new PaintBrush();

function draw(){
    let x = (Mouse.x - Canvas.Canvas.left) / scale;
    let y = (Mouse.y - Canvas.Canvas.top) / scale;
    currentTool.Use(x,y);
}

class Palette{
    static CurrentColor = Colors.Black;
    static PaletteImage = image.create(16,1);
    static PaletteDisplaySprite = sprites.create(Palette.PaletteImage);
    
    static Init(){
        for(let i = 0; i < 16; i++){
            this.PaletteImage.setPixel(i,0,i);
        }


        controller.player1.onButtonEvent(
            ControllerButton.B, 
            ControllerButtonEvent.Pressed, 
            ()=>this.NextColor() // wait i cant even use 'void'? what a scam oh well
        );
    }

    static NextColor(){
        this.CurrentColor++;
        if(this.CurrentColor>=16){
            this.CurrentColor = 0;
        }
    }

    static Update(){
        let DisplayImage = ImageRenderer.Get(this.PaletteImage, 2);
        Canvas.Checkerboard(DisplayImage,[0]);
        DisplayImage = ImageRenderer.Get(DisplayImage, 4);
        this.PaletteDisplaySprite.setImage(
            DisplayImage
        );

        this.PaletteDisplaySprite.setPosition(
            scene.cameraProperty(CameraProperty.X),
            scene.cameraProperty(CameraProperty.Y) - scene.screenHeight()/2 + 4
        );
    }
}

Palette.Init();

function update(){
    if(!canDraw) updateCanDraw();

    Mouse.Update();
    
    Palette.Update();

    Canvas.Update();
}

game.onUpdate(update); // 200 lines! :D *i kinda cheated with that big comment at the front, but i didnt plan this its literally a coincidence