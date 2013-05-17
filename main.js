function submitPost() {
	if (($('#newPost').val() != '') && ($('#newPost').val().length < 142)) {
		var newPost = $('#newPost').val().replace(/\n+/g,"<br>") + '\n';
		$.ajax({
			url: 'savePost.php',
			type: 'post',
			data: {postContent: newPost}
		}).done(function (post){
			loadNew();
			$('#newPost').val('').focus();
		});
	} else {
		var msg = '';
		if ($('#newPost').val() == '') {
			msg += 'Your post cannot be blank.\n';
		}
		if ($('#newPost').val().length >= 142) {
			msg += 'Your post must not be more than 142 characters.\n';
		}
		alert(msg);
	}
}

$(window).scroll(function() {
    if($(window).scrollTop() == $(document).height()-$(window).height()) {
        $('div#loadmore').show();
        $.ajax({
			url: 'noPosts.php',
		}).done(function(noLines) {
			totalLines = noLines;
			if (noLoaded < noLines) {
				if (totalLines-noLoaded < defaultLoad) {
					noLines = (totalLines-noLoaded);
				} else {
					noLines = defaultLoad;
				}
				$.getJSON('getPosts.php', {
					from: (((totalLines-noLoaded-noLines-1) < 1) ? 1 : (totalLines-noLoaded-noLines-1)),
					to: (totalLines-noLoaded-1)
				}).done(function(posts) {
					$.each(posts.reverse(), function (i, item) {
						$('#board ul').append('<li>' + item.replace(exp,"<a href='$1'>$1</a>") + '</li>');
						noLoaded++;
					});
				});
				$('div#loadmore').hide();
			} else {
				$('div#loadmore').html('<center>No more posts to show.</center>');
			}
		});
    }
});

function loadNew(first) {
	if($(window).scrollTop() == 0) {
		$.ajax({
			url: 'noPosts.php',
		}).done(function (fileLength) {
			if (fileLength > noPosts) {
				noPosts = fileLength;
				if (first == 1) {
					var lineFrom = (((fileLength-defaultLoad) < 1) ? 1 : (fileLength-defaultLoad));
					var lineTo = fileLength;
				} else {
					var lineFrom = (noLoaded+1);
					var lineTo = fileLength;
				}
				$.getJSON('getPosts.php', {
					from: lineFrom,
					to: lineTo
				}).done(function(posts) {
					$.each(posts, function (i, item) {
						$('#board ul').prepend('<li>' + item.replace(exp,"<a href='$1'>$1</a>") + '</li>');
						noLoaded++;
					});
				});
			}
		});
	}
}

function resizeElm() {
	$('#newPost').css('width', $('#post').width()-43);
}

var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
var defaultLoad = parseInt($(window).height()/50);
var noLoaded = 0;
var noPosts = 0;

$(document).ready(function () {
	resizeElm();
	$(window).resize(resizeElm);

	loadNew(1);
	setInterval(loadNew, 5000);
});