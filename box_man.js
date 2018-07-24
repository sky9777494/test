//過關條件1、過關條件2
var mission1 = false;
var mission2 = false;
	
// 1.當載入視窗時就執行		
window.addEventListener("load",function() 
{

	//建一個初始化Quintus基本物件和設定 
	//開發者模式會自動重新載入資源
	//載入Audio音效、Sprites圖片、Scenes場景、Input控制、2D世界、Anim動畫、
	//TMX地圖圖檔、Touch觸控、UI介面的模組
	//遊戲世界大小寬600px 高600px
	//使用UI的BUTTON按鈕的話，就一定要加上touch()和載入Touch模組 否則按鈕事件無效
	//音效播放也必須加上enableSound()
	var Q = window.Q = Quintus({ audioSupported: [ 'mp3' ]})
	   		      .include("Audio, Sprites, Scenes, Input, 2D, Anim, TMX, Touch, UI")
			      .setup({ width: 600, height: 600})
			      .controls(true)
				  .touch() 
				  .enableSound();
				
	// 加入基本的鍵盤控制跟搖桿控制(用於觸控面板)
	Q.input.keyboardControls();
	Q.input.joypadControls();
	
	//取消遊戲世界的重力設定
	Q.gravityX = 0;
	Q.gravityY = 0;
	
	//設定遊戲圖層
	Q.SPRITE_NONE = 0;
	Q.SPRITE_PLAYER = 1;
	Q.SPRITE_COLLECTABLE = 2;			
	Q.SPRITE_BOXLOCK = 4;
	Q.SPRITE_BOX = 8;
		
	//主角控制
	Q.component("boxManControls", 
	{
		//設定主角移動速度100, 初始方向朝上
	    defaults: { speed: 100, direction: 'up' },

		//附加在玩家物件身上
		added: function() 
		{
			var p = this.entity.p;

			//將設定給上當前物件
			Q._defaults(p,this.defaults);

			//呼叫執行step
			this.entity.on("step",this,"step");
		},
			
		step: function(dt) 
		{
			//取得當前玩家物件
			var p = this.entity.p;

			//根據玩家物件的移動方向來旋轉人物
			//往右走時
			if(p.vx > 0) 
			{
				p.angle = 90;
			} 
			
			//往左走時
			else if(p.vx < 0) 
			{
				p.angle = -90;
			} 
				
			//往下走時
			else if(p.vy > 0) 
			{
				p.angle = 180;
			} 
				
			//往上走時
			else if(p.vy < 0) 
			{
				p.angle = 0;
			}
	
			//判斷按下的鍵盤按鍵來控制玩家物件的方向
			/*p.direction = Q.inputs['left']  ? 'left' :
							Q.inputs['right'] ? 'right' :
							Q.inputs['up']    ? 'up' :
							Q.inputs['down']  ? 'down' : 'nothing';*/
			//當左方向鍵按下時
			if(Q.inputs['left'] == true)
			{
				p.direction = 'left';
			}
				
			//當右方向鍵按下時			
			else if(Q.inputs['right'] == true)
			{
				p.direction = 'right';
			}
			
			//當上方向鍵按下時					
			else if(Q.inputs['up'] == true)
			{
				p.direction = 'up';
			}
					
			//當下方向鍵按下時		
			else if(Q.inputs['down'] == true)
			{
				p.direction = 'down';
			}
			  
			//什麼事都沒做時		
			else
			{
				p.direction = 'nothing';
			}
				
			//依照給予的玩家方向值判斷該方向增加速度		
			switch(p.direction) 
			{		    
				//給予玩家 加速度x = 本身的移動速度設定(-負數等於反方向 +數為正方向)
				case "left":					
					p.vx = -p.speed;
					p.vy = 0;						
					break;
							
				case "right":
					p.vx = p.speed; 
					p.vy = 0;					
					break;
						
				//給予玩家 加速度y = 本身的移動速度設定(-負數等於反方向 +數為正方向)
				case "up":
					p.vy = -p.speed;
					p.vx = 0;					
					break;
							
				case "down":
					p.vy = p.speed;
					p.vx = 0;					
					break;
				
				//如果什麼都沒做 就停止
				case "nothing":
					p.vx = 0;
					p.vy = 0;
					break;
			}
		}
	});
		  
	//玩家物件
	Q.Sprite.extend("Player", 
	{
		init: function(p) 
		{
			//在tmx的載入圖片集名稱
			p.sheet = "Player";
			
			//載入動畫物件名稱
			p.sprite = "Player";      
			
			//由左往右數 在圖片集的第幾個圖案 從0開始
			p.frame = 0;
			
			//設定玩家物件的圖層值
			p.type = Q.SPRITE_PLAYER;	
			
			//設定玩家物件的碰撞目標圖層
			p.collisionMask = Q.SPRITE_DEFAULT;
			
			//初始建置該物件
			this._super(p);	
			
			//載入2d、動畫、玩家物件的控制元件
			this.add("2d, animation, boxManControls");
		},
			
		step: function(dt) 
		{		
			//當按下左右上下方向鍵就播放玩家走路動畫
			if(Q.inputs['left'] || Q.inputs['right'] ||
			   Q.inputs['up']   || Q.inputs['down'])
			{
				this.play("player_walk");
			}
		
			//播放玩家待機動畫
			else
			{					
				this.play("player_idel");
			}
		}
	});
		
	//箱子物件
	Q.Sprite.extend("Box",
	{
		init: function(p)
		{
			//在tmx的載入圖片集名稱
			p.sheet = "Map";
			p.frame = 5;
			
			//sensor感應器 設為關閉
			p.sensor = false;	
			p.type = Q.SPRITE_BOX;			
			
			//碰撞遮罩 只跟玩家物件碰撞做反應
			p.collisionMask = Q.SPRITE_PLAYER;
			this._super(p);
			this.add("2d");	
		}		
	});
			
	//箱子目的地物件
	Q.Sprite.extend("Box_lock",
	{
		init: function(p)
		{		
			//在tmx的載入圖片集名稱
			p.sheet = "Map";
			
			//取第一張透明圖 實現透明碰撞區
			p.frame = 0;
			
			//sensor感應器 設為開啟時，可以讓其他物件穿透
			//且不會移動該物件
			p.sensor = true;
			p.type = Q.SPRITE_BOXLOCK;
			
			//碰撞遮罩 設為只跟箱子物件碰撞做反應
			p.collisionMask = Q.SPRITE_BOX;
							
			this._super(p);
			this.add("2d");
			
			//當感應器碰撞了就做這個function
			this.on("sensor");
		},
	
		//當感應器碰撞了可以調回 該碰撞物col
		sensor: function(col) 
		{
			//可以直接以下列來設定該碰撞物的sensor值
			//col.p.sensor = this;
			
			//當箱子擺放區域被撞到就設為 Q.SPRITE_NONE
			//不重覆判斷也不與任何物件感應碰撞
			this.p.collisionMask = Q.SPRITE_NONE;	

			//如果過關條件1或過關條件2的變數有一個還是沒達成
			if(mission1 == false | mission2 == false)
			{
				//如果過關條件1有達成
				if(mission1)
				{
					mission2 = true;					
				}		
				
				//如果過關條件1沒有達成
				else
				{
					mission1 = true;						
				}
			}			
		
			//如果兩個過關條件都達成了 
			if(mission1 && mission2)
			{					
				//播放勝利歡呼聲
				//先調整音量 在播放特定音效
				Q.audio.volume = 1;
				
				//音效檔必須放在專案資料夾內的audio資料夾內
				//沒有的話 可以自己創建同名
				//Q.audio.play('檔名.檔案類型');
				Q.audio.play('soundclip.mp3');
				
				//顯示勝利提示視窗和遊戲重新開始按鈕
				Q.stageScene("endGame",1, { label: "You Won!" }); 					
			}						
		}			
	});
	
	//遊戲主場景level1
	//一開始遊戲就只執行一次
	Q.scene("level1",function(stage) 
	{
		//載入TMX場景
		Q.stageTMX("map2.tmx", stage); 
		
		//創建載入玩家角色
		var player = Q("Player").first();
			
		//一開始預設過關條件為false
		mission1 = false;
		mission2 = false;
					
		//先調整音量 在播放特定音效
		Q.audio.volume = 0.3;
		
		//播放特效且 設定為循環播放 和 音量減半
		//Q.audio.play("audio資料夾下的檔案名稱", { 屬性設定 });
		Q.audio.play("bgm.mp3", { loop: true, volume:0.5});				
	});

	//勝利視窗UI畫面
	Q.scene('endGame',function(stage) 
	{
		//繪製UI視窗
		var container = stage.insert(new Q.UI.Container({
		x: Q.width/2, y: Q.height/2, fill: "rgba(220,220,220,0.8)"
		}));
		  
		//繪製按鈕在container視窗內  
		var button = container.insert(new Q.UI.Button({
		x: 0, y: 0, fill: "#ffffff", label: "Play Again"
		})); 
		
		//繪製標籤在container視窗內
		//stage.options.label 偵測遞回的label標題名稱													  
		var label = container.insert(new Q.UI.Text({
		x:10, y: -10 - button.p.h, label: stage.options.label
		}));
		  
		//當按下按鈕就會重新開始遊戲
		button.on("click",function() 
		{
			//先停止所有的音樂音效 避免重複播放
			Q.audio.stop();
			
			//清除當前畫面的所有場景畫面
			Q.clearStages();
			
			//重新載入level1 遊戲主場景
			Q.stageScene('level1');				
		});
		  
		//設定視窗大小去適應該視窗內的內容
		container.fit(20);
	});
		
	//載入資源
	Q.loadTMX("map1.tmx, soundclip.mp3, bgm.mp3, player.json, player.png", function() 
	{       
		//載入玩家動畫檔
		Q.compileSheets("player.png","player.json");
		
		//設定玩家動畫元件的不同人物動畫
		Q.animations("Player",
		{
			//動畫片段名稱: { frames第幾個圖片是播放範圍, rate播放速率...等屬性 }
			player_idel: { frames:[0], rate: 1/2 },			  
			player_walk: { frames:[1, 0], rate: 1/2 }
		});
			
		//載入完資源後才載入遊戲主場景	
		Q.stageScene("level1");			
	});		
});