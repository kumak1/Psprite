/*==============================================================================
 CSS Spriteの作成
 
 @version 0.1,  3 AUG 2014
 @author @kumak1
==============================================================================*/
#target photoshop
(function() {

    // 定数の宣言
    const def = {
        // ファイル
        fileHtm: "/index.html",
        fileCss: "/style.css",
        fileImg: "/sprite.png",

        // ダイアログのタイトル表示
        titleDialog: "Psprite",
        titleOutput: "Output",
        titleOption: "Option",

        // ダイアログのラベル表示
        lblHtm: "　index.html を作成する。",
        lblCss: "　style.css を作成する。",
        lblImg: "　sprite.png を作成する。",
        lblSet: "　グループ毎に作成する。",

        // ダイアログのボタン表示
        btnChoseDir: "...",
        btnCancel: "キャンセル",
        btnOutput: "出力",

        // ダイアログのメッセージ表示
        msgMustOpenFiles: "ファイルを開いてから実行して下さい。",
        msgChoseDir: "出力フォルダを選択して下さい。",
        msgFileOutputFalse: "ファイルを正しく出力できませんでした。",
        msgFin: "ファイルを出力しました。"
    };

    // 自動実行
    (function() {
        // ファイルを開いているかチェック
        if (documents.length == 0) {
            alert(def.msgMustOpenFiles);
            return;
        }

        //ダイアログ表示
        var dialog = OpenDialog();

        // 「出力先選択」ボタンのイベント
        dialog.btnPath.onClick = function() {
            dialog.lblPath.text = Folder.selectDialog("Select");
        }

        // 「キャンセル」ボタンのイベント
        dialog.btnCancel.onClick = function() {
            dialog.close();
        }

        // 「出力」ボタンのイベント
        dialog.btnOutput.onClick = function() {
            //処理時間計測用
            var actionTime = new Date().getTime();
            
            //出力するディレクトリが指定されていない場合、処理を抜ける
            if (dialog.lblPath.text == def.msgChoseDir) {
                alert(def.msgChoseDir);
                return;
            }

            //出力チェック
            var checkInfo = {
                hasHtm: dialog.chkMakeHTM.value,
                hasCss: dialog.chkMakeCSS.value,
                hasImg: dialog.chkMakeIMG.value,
                hasSet: dialog.chkMakeSet.value
            };

            //レイヤー情報の取得
            var layerInfo = (checkInfo.hasSet) ? GetSetInfo(activeDocument) : GetLayerInfo(activeDocument);

            //HTML生成
            if (checkInfo.hasHtm) {
                FileOutput(dialog.lblPath.text + def.fileHtm, GenerateHTML(layerInfo));
            }
            //CSS生成
            if (checkInfo.hasCss) {
                FileOutput(dialog.lblPath.text + def.fileCss, GenerateCSS(layerInfo));
            }
            //PNG生成
            if (checkInfo.hasImg) {
                ImageOutput(dialog.lblPath.text + def.fileImg);
            }
            alert(def.msgFin + "\r\n処理時間 : " + (new Date().getTime() - actionTime) + "ms.");
        }
        dialog.show();
    })();

    //ダイアログ表示
    function OpenDialog() {
        const DIALOG = "dialog";
        const PANEL = "panel";
        const TEXT = "statictext";
        const BUTTON = "button";
        const CHECK = "checkbox";

        var common = new CommonDialog();

        //ウィンドウ生成
        win = new Window(DIALOG, def.titleDialog);
        win.bounds = common.getBoundsDialog();
        win.center();

        // 「Output」パネルの表示
        pnlPath = win.add(PANEL, common.getBoundsOutputPanel(), def.titleOutput);
        pnlPathInner = common.getBoundsPanel(pnlPath);
        win.lblPath = win.add(TEXT, pnlPathInner.get(), def.msgChoseDir);
        win.btnPath = win.add(BUTTON, common.getBoundsOutputButton(win.lblPath), def.btnChoseDir);

        //「Option」パネルの表示
        pnlOption = win.add(PANEL, common.getBoundsOptionPanel(pnlPath), def.titleOption);
        pnlOptionInner = common.getBoundsPanel(pnlOption);
        win.chkMakeHTM = win.add(CHECK, pnlOptionInner.get(), def.lblHtm);
        win.chkMakeCSS = win.add(CHECK, pnlOptionInner.get(), def.lblCss);
        win.chkMakeIMG = win.add(CHECK, pnlOptionInner.get(), def.lblImg);
        win.chkMakeSet = win.add(CHECK, pnlOptionInner.get(), def.lblSet);

        win.chkMakeHTM.value = true;
        win.chkMakeCSS.value = true;
        win.chkMakeIMG.value = true;

        //「出力/キャンセル」ボタンの表示
        btnAreaInner = common.getBoundsButton();
        win.btnCancel = win.add(BUTTON, btnAreaInner.get(), def.btnCancel);
        win.btnOutput = win.add(BUTTON, btnAreaInner.get(), def.btnOutput);

        return win;
    }

    //ダイアログ表示用
    function CommonDialog() {
        const _OFFSET_X_MIN_ = 10;
        const _OFFSET_Y_MIN_ = 10;
        const _WINDOW_WIDTH_ = 400;
        const _WINDOW_HEIGHT_ = 350;
        const _PANEL_PADDING_INNER_ = 28;
        const _PANEL_MARGIN_ = 20;
        const _PANEL_LINEHEIGHT_ = 18;
        const _PANEL_HEIGHT_OUTPUT_ = 55;
        const _PANEL_HEIGHT_OPTION_ = 140;
        const _BUTTON_WIDTH_ = 80;
        const _BUTTON_HEIGHT_ = 30;
        const _OFFSET_X_ = _WINDOW_WIDTH_ - _OFFSET_X_MIN_;
        const _OFFSET_X_CALC_ = _BUTTON_WIDTH_ + _OFFSET_X_MIN_;
        const _OFFSET_Y_ = _WINDOW_HEIGHT_ - _BUTTON_HEIGHT_ - _PANEL_MARGIN_;

        //位置情報を取得
        var GetBounds =
            function(offsetX, offsetY, width, height) {
                return [offsetX, offsetY, offsetX + width, offsetY + height]
            };
        //対象オブジェクトの幅を取得
        var GetObjWidth =
            function(obj) {
                return obj.bounds[2] - obj.bounds[0];
            };
        //ウインドウ幅に合わせた位置情報を取得
        var GetBoundsFixed =
            function(offsetY, height) {
                return GetBounds(_OFFSET_X_MIN_, offsetY, _WINDOW_WIDTH_ - (_OFFSET_X_MIN_ * 2), height);
            };
        //対象オブジェクト左上から、+X軸+Y軸 移動した位置情報を取得
        var GetBoundsL =
            function(obj, absoluteX, absoluteY, width, height) {
                return GetBounds(obj.bounds[0] + absoluteX, obj.bounds[1] + absoluteY, width, height);
            };
        //対象オブジェクト右上から、-X軸+Y軸 移動した位置情報を取得
        var GetBoundsR =
            function(obj, absoluteX, absoluteY, width, height) {
                return GetBounds(obj.bounds[2] - absoluteX - width, obj.bounds[1] + absoluteY, width, height);
            };
        //Dialogの位置情報を取得
        var GetBoundsDialog =
            function() {
                return GetBounds(0, 0, _WINDOW_WIDTH_, _WINDOW_HEIGHT_);
            };
        //Outputのパネルの位置情報を取得
        var GetBoundsOutputPanel =
            function() {
                return GetBoundsFixed(_OFFSET_Y_MIN_, _PANEL_HEIGHT_OUTPUT_);
            };
        //Outputのボタンの位置情報を取得
        var GetBoundsOutputButton =
            function(obj) {
                return GetBoundsR(obj, 0, 0, 18, 18);
            };
        //Optionのパネルの位置情報を取得
        var GetBoundsOptionPanel =
            function(obj) {
                return GetBoundsFixed(obj.bounds[3] + _PANEL_MARGIN_, _PANEL_HEIGHT_OPTION_);
            };
        //ボタン用の位置情報を取得
        var GetBoundsButton =
            function() {
                var cnt = 0;
                return {
                    get: function() {
                        cnt++;
                        return GetBounds(_OFFSET_X_ - (_OFFSET_X_CALC_ * cnt), _OFFSET_Y_, _BUTTON_WIDTH_, _BUTTON_HEIGHT_);
                    }
                }
            };
        //対象パネル内の位置情報を行インクリメント取得
        var GetBoundsPanel =
            function(obj) {
                var cnt = 0;
                return {
                    get: function() {
                        cnt++;
                        return GetBoundsL(obj, _PANEL_PADDING_INNER_, _PANEL_PADDING_INNER_ * cnt, GetObjWidth(obj) - 15 - _PANEL_PADDING_INNER_, _PANEL_LINEHEIGHT_);
                    }
                }
            }
        return {
            getBounds: GetBounds,
            getObjWidth: GetObjWidth,
            getBoundsFixed: GetBoundsFixed,
            getBoundsL: GetBoundsL,
            getBoundsR: GetBoundsR,
            getBoundsDialog: GetBoundsDialog,
            getBoundsOutputPanel: GetBoundsOutputPanel,
            getBoundsOutputButton: GetBoundsOutputButton,
            getBoundsOptionPanel: GetBoundsOptionPanel,
            getBoundsButton: GetBoundsButton,
            getBoundsPanel: GetBoundsPanel,
        }
    }

    //レイヤー情報の取得
    function GetLayerInfo(doc) {
        var results = new Array;

        var AddLayer = function AddLayer(arg) {
            //関数をキャッシュ
            var layerInfo = LayerInfo;
            
            for (var key in arg) {
                switch (key) {
                    case "artLayers":
                        var layer = arg[key];
                        for (var i = 0, len = layer.length; i < len; i++) {
                            var target = layer[i];
                            if (target.visible){
                                results.push(layerInfo(target));
                            }
                        }
                        break;
                    case "layerSets":
                        var layer = arg[key];
                        for (var i = 0, len = layer.length; i < len; i++) {
                            AddLayer(layer[i]);
                        }
                        break;
                    default:
                        break;
                }
            }
        }(doc);

        return results;
    }

    //レイヤー情報の取得
    function GetSetInfo(doc) {
        var results = new Array;

        var artLayer = doc["artLayers"];
        for (var i = 0, len = artLayer.length; i < len; i++) {
            var target = artLayer[i];
            if (target.visible){
                results.push(LayerInfo(target));
            }
        }

        var layerSet = doc["layerSets"];
        for (var i = 0, len = layerSet.length; i < len; i++) {
            var group = layerSet[i];
            var layer = GetLayerInfo(group);

            results.push(LayerInfo({
                name: group.name,
                bounds: GetMaxBounds(layer)
            }));
        }

        return results;
    }

    // レイヤー群から最大となる位置情報を取得
    function GetMaxBounds (obj) {
        var b0 = new Array;
        var b1 = new Array;
        var b2 = new Array;
        var b3 = new Array;

        for (var i = 0, len = obj.length; i < len ; i++) {
            var layer = obj[i];
            b0[i] = layer.bounds[0];
            b1[i] = layer.bounds[1];
            b2[i] = layer.bounds[2];
            b3[i] = layer.bounds[3];
        }
    
        var result = new Array;
        result[0] = Math.min.apply(null, b0);
        result[1] = Math.min.apply(null, b1);
        result[2] = Math.max.apply(null, b2);
        result[3] = Math.max.apply(null, b3);
        
        return result;
    }

    // レイヤー情報インスタンス生成
    function LayerInfo(obj) {
        var result = new Object;
        
        //レイヤー名
        result.name = obj.name.replace(" ", "_");
        //レイヤー位置
        result.offsetX = parseInt(obj.bounds[0]); //X軸
        result.offsetY = parseInt(obj.bounds[1]); //Y軸
        //レイヤー幅
        result.width = parseInt(obj.bounds[2]) - result.offsetX; //X軸
        result.height = parseInt(obj.bounds[3]) - result.offsetY; //Y軸
        result.bounds = obj.bounds;
        
        return result;
    }

    //HTML生成
    function GenerateHTML(layerInfo) {
        var html = new Array;
        html.push('<!DOCTYPE html>');
        html.push('<html lang="ja">');
        html.push('<head>');
        html.push('<title>Psprite</title>');
        html.push('<meta charset="shift_jis">');
        html.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
        html.push('<link rel="stylesheet" href=".' + def.fileCss + '">');
        html.push('<link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/pure-min.css">');
        html.push('<link rel="stylesheet" href="http://yui.yahooapis.com/pure/0.5.0/grids-responsive.css">');
        html.push('</head>');
        html.push('<body>');

        html.push('<div class="header">');
        html.push('  <h1>Psprite</h1>');
        html.push('  <h2>Quickstart your next web project with these example css.</h2>');
        html.push('</div>');

        html.push('<div class="content">')
        for (key in layerInfo) {
            html.push('  <h3>' + layerInfo[key].name + '</h3>');

            html.push('<pre><code>{');
            html.push('  background-image: url("sprite.png");');
            html.push('  background-repeat: no-repeat;')
            html.push('  display: block;');
            html.push('  overflow: hidden;');
            html.push('  text-indent: 100%;');
            html.push('  white-space: nowrap;');
            html.push('  background-position: -' + layerInfo[key].offsetX + 'px -' + layerInfo[key].offsetY + 'px;');
            html.push('  width: ' + layerInfo[key].width + 'px;');
            html.push('  height: ' + layerInfo[key].height + 'px;');
            html.push('}');
            html.push('</code></pre>');

            html.push('  <div class="' + layerInfo[key].name + '"></div>');
        }
        html.push('</div>');

        html.push('<div class="footer">');
        html.push('  <div class="legal pure-g">');
        html.push('    <div class="pure-u-1-2">');
        html.push('      <p class="legal-license">');
        html.push('        Designed by <a href="https://twitter.com/kumak1">@kumak1</a>.<br>');
        html.push('        Code licensed under <a target="_blank" href="https://github.com/twbs/bootstrap/blob/master/LICENSE">MIT</a>.');
        html.push('      </p>');
        html.push('    </div>');
        html.push('  <div class="pure-u-1-2">');
        html.push('    <ul class="legal-links">');
        html.push('      <li><a href="https://github.com/kumak1/Psprite">GitHub Project</a></li>');
        html.push('    </ul>');
        html.push('    <p class="legal-copyright">');
        html.push('      &copy; 2014 kumak1. All rights reserved.');
        html.push('    </p>');
        html.push('  </div>');
        html.push('</div>');

        html.push('</body>');
        html.push('</html>');

        return html.join("\r\n");
    }

    //CSS生成
    function GenerateCSS(layerInfo) {
        var css = new Array;

        var base = "";
        for (key in layerInfo) {
            base += ('.' + layerInfo[key].name + ',');
        }
        base = base.slice(0, -1);

        css.push(base + '{');
        css.push('  background-image: url("sprite.png");');
        css.push('  background-repeat: no-repeat;')
        css.push('  display: block;');
        css.push('  overflow: hidden;');
        css.push('  text-indent: 100%;');
        css.push('  white-space: nowrap;');
        css.push('}');

        for (key in layerInfo) {
            css.push('.' + layerInfo[key].name + ' {');
            css.push('  background-position: -' + layerInfo[key].offsetX + 'px -' + layerInfo[key].offsetY + 'px;');
            css.push('  width: ' + layerInfo[key].width + 'px;');
            css.push('  height: ' + layerInfo[key].height + 'px;');
            css.push('}');
        }
        css.push('body {color:#777;}');
        css.push('.header {background: none repeat scroll 0 0 #fff;border-bottom: 1px solid #eee;margin: 0 auto;max-width: 768px;padding: 1em;text-align: center;}');
        css.push('.header h1 {font-family:"omnes-pro";font-size: 3em;font-weight: 100;margin: 0;color: rgb(75, 75, 75);}');
        css.push('.header h2 {color: #666;font-size: 1.2em;font-weight: 100;line-height: 1.5;margin: 0;}');
        css.push('.content {margin-left: auto;margin-right: auto;max-width: 768px;padding-left: 2em;padding-right: 2em;}');
        css.push('.content h3 {color: #555;font-size: 1em;font-weight: 100;line-height: 1.5;margin:4em 0 0;}');
        css.push('.footer {background: none repeat scroll 0 0 rgb(250, 250, 250);border-top: 1px solid #eee;font-size: 87.5%;margin-top: 3.4em;padding: 1.1em;}');
        css.push('.legal-license {margin: 0;text-align: left;}');
        css.push('.legal-copyright, .legal-links, .legal-links li {margin: 0;text-align: right;}');
        css.push('.legal-links {list-style: none outside none;margin-bottom: 0;padding: 0;}');
        css.push('pre, code {background: none repeat scroll 0 0 rgb(250, 250, 250);color: #333;font-family: Ricty,Consolas,"Liberation Mono",Courier,monospace;font-size: 1em;}');
        css.push('pre {white-space: pre-wrap;word-wrap: break-word; padding:1.6em;border:1px #ddd solid}');
        return css.join("\r\n");
    }

    // ファイル出力
    function FileOutput(filename, arg) {
        if (filename) {
            fileObj = new File(filename);
            flag = fileObj.open("w");

            if (flag == true) {
                fileObj.write(arg);
                fileObj.close();
            } else {
                alert(def.msgFileOutputFalse);
            }
        }
    }

    // 画像出力
    function ImageOutput(filename) {
        if (filename) {
            fileObj = new File(filename);
            flag = fileObj.open("w");

            if (flag == true) {
                pngOpt = new ExportOptionsSaveForWeb();
                pngOpt.format = SaveDocumentType.PNG;
                pngOpt.PNG8 = false;
                pngOpt.includeProfile = false;
                pngOpt.interlaced = false;
                pngOpt.alphaChannels = true;
                activeDocument.exportDocument (fileObj, ExportType.SAVEFORWEB, pngOpt);
            } else {
                alert(def.msgFileOutputFalse);
            }
        }
    }
})();