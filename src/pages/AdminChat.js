import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaPencilAlt, FaTrash } from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:3000';

const AdminChat = ({ staffs, isAdmin, receivedMessages, sentMessages, setReceivedMessages, content, setContent, deleteMessage, updateMessage, setSentMessages, selectedStaffId, setSelectedStaffId }) => {
  const [isSendDisabled, setIsSendDisabled] = useState(true);

  const sentByStaff = (message) => {
    return message.sender_type === 'staff';
  };

  const sentByAdmin = (message) => {
    return message.sender_type === 'admin';
  };

  const createMessage = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/send_to_staff/${selectedStaffId}`,
        {
          content,
          staff_id: selectedStaffId,
          channel: isAdmin ? `admin_${selectedStaffId}` : `staff_${selectedStaffId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the sent messages state
      setSentMessages([...sentMessages, response.data]);
      setContent('');
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  useEffect(() => {
    setIsSendDisabled(content.trim() === '');
  }, [content]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightgold">
      <div className="bg-white border rounded-lg shadow-lg p-4 w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2">
        <h1 className="text-2xl font-semibold mb-4">Admin Chat</h1>

        {/* Dropdown to select a staff */}
        <div className="mb-4">
          <select
            className="border rounded p-2 w-full"
            onChange={(e) => setSelectedStaffId(e.target.value)}
            value={selectedStaffId || ''}
          >
            <option value="">Select a Staff</option>
            {staffs.map((staff) => (
              <option key={staff.id} value={staff.id}>
                {staff.staff_name}
              </option>
            ))}
          </select>
        </div>

        {/* Messages List */}
        {selectedStaffId !== null ? (
          <ul className="divide-y divide-gray-200">
            {[...receivedMessages, ...sentMessages]
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map((message) => (
                <li
                  key={message.id}
                  className={`py-2 flex flex-col ${
                    sentByAdmin(message) ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg p-2 break-words ${
                      sentByAdmin(message)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                  {(sentByStaff || sentByAdmin(message)) && (
                    <div className="flex space-x-2 mt-1">
                      <button
                        className="text-blue-500 hover:text-blue-700 text-xs"
                        onClick={() => {
                          const newContent = prompt('Edit the message:', message.content);
                          if (newContent !== null) {
                            updateMessage(message.id, newContent);
                          }
                        }}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 text-xs"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500">Select a staff to view their chats</p>
        )}

        {/* Message Input */}
        {selectedStaffId !== null && (
          <div className="mt-4 flex items-center">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-grow border rounded-full py-2 px-4 pl-6 focus:outline-none focus:ring focus:border-blue-300"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              className={`bg-blue-500 text-blue rounded-full p-2 hover:bg-blue-600 ${
                isSendDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => createMessage()}
              disabled={isSendDisabled}
              style={{ transform: 'rotate(0deg)', marginLeft: '4px' }}
            >
              <FaPaperPlane size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;