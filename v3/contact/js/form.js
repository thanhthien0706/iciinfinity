var REQUIRED_FIELDS = 8;
var RADIO_GROUP_CLASS = 'js-radioGroup';
var CHECKBOX_GROUP_CLASS = 'js-checkboxGroup';
var ITEM_GROUP_CLASS = 'js-itemGroup';

var COMPLETE_CLASS = 'success';
var ERROR_CLASS = 'error';
var ERROR_MESSAGE_CLASS = 'errorMsg';

$(function() {
	// イージング
	$.extend($.easing,{
		easeOutCubic: function (x, t, b, c, d) {
			return c*((t=t/d-1)*t*t + 1) + b;
		}
	});
	// オートカナ設定（プラグイン）
	$.fn.autoKana('input[name=name]', 'input[name=name_kana]', {
		katakana: false  // true：カタカナ、false：ひらがな（デフォルト）
	});
	// 名前からカーソルが出たとき、カナに値がセットされていたらチェックをする
	var bufferKanaValue = '';
	$('input[name=name]').focus(function() {
		bufferKanaValue = $('input[name=name_kana]').val();
	}).blur(function() {
		var $nameKana = $('input[name=name_kana]');
		var kanaValue = $nameKana.val();
		if (!isEmpty(kanaValue) || !isEmpty(bufferKanaValue)) {
			$nameKana.trigger('blur');
		}
	});
	// 入力チェック
	$.fn['validator'] = function(args) {
		var defaults = {
			type: 'input',
			empty: true,
			maxLength: 255,
			name: '',
			format: ''
		}
		var params = $.extend(defaults, args);
		var self = $(this);
		var events = 'blur';
		if (params.type === 'radio' || params.type === 'checkbox' || params.type === 'select') events += ' change';
		self.on(events, function(e) {
			check(e);
		});
		function check(e) {
			var value = self.val();
			if (params.type === 'radio') {
				var $radioGroup = self.parents('.' + RADIO_GROUP_CLASS);
				value = $radioGroup.find('input[type=radio]:checked').val();
			} else if (params.type === 'checkbox') {
				var $checkboxGroup = self.parents('.' + CHECKBOX_GROUP_CLASS);
				value = $checkboxGroup.find('input[type=checkbox]:checked').val();
			}
			var errorMessage = '';
			if (!params.empty) {
				if (isEmpty(value)) {
					if (params.type === 'radio' || params.type === 'checkbox' || params.type === 'select' || params.type === 'file') {
						errorMessage = ((params.name != '') ? params.name + 'を' : '') + '選択してください。';
					} else {
						errorMessage = ((params.name != '') ? params.name + 'を' : '') + '入力してください。';
					}
				}
			}
			if (isEmpty(errorMessage) && params.maxLength > 0) {
				if (value.length > params.maxLength) {
					errorMessage = ((params.name != '') ? params.name + 'は' : '') + params.maxLength + '文字以内で入力してください。';
				}
			}
			if (isEmpty(errorMessage) && params.format === 'mail') {
				value = zen2han(value);
				self.val(value);
				if (!isValidMailFormat(value)) errorMessage = ((params.name != '') ? params.name + 'へ' : '') + '入力した値は無効です。';
			}
			if (isEmpty(errorMessage) && params.format === 'tel') {
				value = zen2han(value);
				self.val(value);
				if (!isValidTelFormat(value)) errorMessage = ((params.name != '') ? params.name + 'へ' : '') + '入力した値は無効です。';
			}
			var $itemGroup = self.parents('.' + ITEM_GROUP_CLASS);
			$itemGroup.removeClass(COMPLETE_CLASS).removeClass(ERROR_CLASS);
			var $errorMessage = $itemGroup.find('.' + ERROR_MESSAGE_CLASS);
			if (!isEmpty(errorMessage)) {
				$errorMessage.text(errorMessage);
				$itemGroup.addClass(ERROR_CLASS);
			} else {
				$errorMessage.text('');
				$itemGroup.addClass(COMPLETE_CLASS);
			}
		}
	}
	// 入力チェック項目定義
	$('input[name=name]').validator({
		empty: false,
		name: 'お名前'
	});
	$('input[name=name_kana]').validator({
		empty: false,
		name: 'お名前のふりがな'
	});
	$('input[name=company]').validator({
		empty: false,
		name: '御社名'
	});
	$('input[name=tel]').validator({
		empty: false,
		name: '電話番号',
		format: 'tel'
	});
	$('input[name=email]').validator({
		empty: false,
		name: 'メールアドレス',
		format: 'mail'
	});
	$('textarea[name=contact]').validator({
		empty: false,
		name: 'お問い合わせ内容',
		maxLength: 500,
	});
	// 再入力画面表示
	if ($('body.back').size() > 0) {
		$('input, select, textarea').each(function() {
			$(this).trigger('blur');
		});
	}
	// サブミット前チェック
	$('#contact_form').submit(function() {
		$('input, select, textarea').each(function() {
			$(this).trigger('blur');
		});
		// エラーがなければサブミット
		if ($('form .' + ERROR_CLASS).size() == 0) {
			return true;
		}
		// トップへ移動
		$('body,html').animate({scrollTop: ($('form .' + ERROR_CLASS).eq(0).offset().top)}, 500, 'easeOutCubic');
		return false;
	});
});

// 共通関数
function zen2han(s) {
	var zenkigou = "＠－ー＋＿．，、";
	var hankigou = "@--+_...";
	var str = "";
	for (i=0; i < s.length; i++) {
		var dataChar = s.charAt(i);
		var dataNum = zenkigou.indexOf(dataChar, 0);
		if (dataNum >= 0) dataChar = hankigou.charAt(dataNum);
		str += dataChar;
	}
	var hankaku = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s){return String.fromCharCode(s.charCodeAt(0)-0xFEE0)});
	return hankaku;
}
function isEmpty(s) {
	if (s === null || s === undefined) {
		return true;
	} else if (typeof s == 'string') {
		return s.replace(/ 　/g, "")==="" ? true : false;
	} else {
		return false;
	}
}
function isOnlyNumeric(s) {
	if (isNaN(s)) {
		return false;
	}
	return true;
}
function isValidMailFormat(s) {
	if (!s.match(/^[\w_\-\.]+@[\w_-]+(\.[\w_-]+){1,}$/)) {
		return false;
	}
	return true;
}
function isValidTelFormat(s) {
	// 0から始まる2桁以上4桁以下-１桁以上4桁以下-3桁以上4桁以下
	if (!s.match(/^0\d{1,4}-\d{1,4}-\d{3,4}$/)) {
		// 数値のみ
		if (!s.match(/^\d{7,13}$/)) {
			return false;
		}
	}
	return true;
}
