from flask import Flask, request

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
    notifiers = request.json
    print(notifiers)
    return 'Received', 200

if __name__ == '__main__':
    app.run(debug=True)