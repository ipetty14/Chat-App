(function($) {

  // window.location.origin polyfill support for IE
  if(!window.location.origin) { window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');}

  // Connect to host and port with protocol listed
  // in the browser
  var socket = io.connect(window.location.origin);

  var chatNameSection = $('.chat-name-section'),
      chatBoxSection = $('.chat-box-section'),
      chatInputSection = $('.chat-input-section'),
      chatSound = new Howl({
        urls: ['/sounds/notify.ogg', '/sounds/notify.mp3', '/sounds/notify.wav']
      });

  var chatNameForm = $('#chatNameForm'),
      chatInputForm = $('#chatInputForm');

  var chatBox = $('#chatBox'),
      chatTextBox = $('#chatTextBox');
      usersBox = $('#usersBox');

  var popupButton = $('#usersOnlineBtn'),
      numUsersOnline = popupButton.find('.badge');

  // Socket Events

  // If username already exists
  socket.on('username taken', function() {
    chatNameSection.find('.form-group').addClass('has-error has-username-taken');
  });

  // Welcome the new user to the chat
  socket.on('welcome', function(username, usernames) {

    // Show the chat area
    chatNameSection.remove();
    chatBoxSection.show(500);
    chatInputSection.show(500);

    chatBoxSection.find('#user').html('Hello, <span class="text-success">' + username + '</span>');

    // Update list of usernames
    updateUsers(usernames);
  });

  // Broadcast to the chatroom that a new user has joined
  socket.on('user joined', function(username, usernames) {
    var userJoinedMsg = '<p class="text-primary"><em><u>' + username + '</u> has joined the chat.</em></p>';

    appendAndScroll(userJoinedMsg);
    updateUsers(usernames)
  });

  socket.on('incoming', function(data, self) {
    var username = self ? 'You' : data.username;
    var self = self ? 'self' : '';
    var receivedMessage = '<p class="entry ' + self + '"><b class="text-primary">' + username + ' said: </b>' + data.message + '</p>';

    appendAndScroll(receivedMessage);
  });

  // UI Events

  // Submit handler for name entry box
  chatNameForm.on('submit', function(e) {
    e.preventDefault();

    var chatName = $.trim(chatNameSection.find('#name').val());

    if (chatName != '') {
      // Socket sends the username to the server to check
      // if it already exists
      socket.emit('new user', {username: sanitize(chatName)});
    } else {
      chatNameSection.find('.form-group').addClass('has-error');
    }
  });

  // Submit handler for message box
  chatInputForm.on('submit', function(e) {
    e.preventDefault();
    validateAndSend();
  });

  // Submit handler for message send button
  // Will send only when 'Enter' key is pressed alone
  // or when button is clicked. If Shift, Ctrl & Alt
  // are pressed as well the message will not send
  chatTextBox.on('keypress', function(e) {
    if (e.which === 13 && e.shiftKey === false &&
        e.altKey === false && e.ctrlKey === false &&
        // Ensuring to exclude touch devices in this program
        ('ontouchstart' in window === false || 'msMaxTouchPoints' in window.navigator === false)) {

          // Submit form
          chatInputForm.submit();

          // Prevent cursor from shifting to the next line
          return false;
    }
  });

  // Remove error when input is typed in by users
  chatNameSection.find('#name').on('keypress', function(e) {
    chatNameSection.find('.has-error').removeClass('has-error').removeClass('has-username-taken');
  });

  // Popup from Bootstrap Components used to see active users
  popupButton.on('click', function(e) {
    usersBox.modal();
  });

  // Functions to help link server and chat programs for all users

  // Convert HTML tags into strings
  var sanitize = (input) => {
    var input = input.replace(/>/g, '&gt;').replace(/<g/, '&lt;').replace('\n', '<br/>');
    return input;
  };

  var appendAndScroll = (html) => {
    chatBox.append(html);
    chatBox.scrollTop(chatBox[0].scrollHeight);

    // Play chat sound
    chatSound.play();
  };

  var validateAndSend = () => {
    var chatMsg = $.trim(chatTextBox.val());

    if(chatMsg != '') {
      socket.emit('outgoing', { message: sanitize(chatMsg) });

      // Clear chat text field after message is sent
      chatTextBox.val('');
    }
  };

  var updateUsers = (usernames) => {

    var users = '<ul class="list-group">';

    for (var i = 0; i < usernames.length; i++) {
      users += '<li class="list-group-item">' + usernames[i] + '</li>';
    }

    users += '</ul>';

    // Update users online box
    usersBox.find('.modal-body').html(users);

    // Update 'Users Online' count
    numUsersOnline.text(usernames.length);
  };
})(jQuery);
