## CAT304-WasteX
Welcome to the CAT304-WasteX project! This guide provides step-by-step instructions on how to set up and run the project in a local environment.

---

### Prerequisites
- Laragon (to provide a local web server environment)
- Python
- Node.js and npm
- Git

---
  
### How to Start
1. Clone the Project Repository
Use the following command to clone the repository:
   ```
   git clone <repository-url>
   ```

<br>

2. Set Up Environment Variables
   - Obtain the `.env` file with the necessary environment variables (provided privately).
   - Place the `.env` file in the root directory of the project.

<br>

3. Open Command Prompt
   * Change Directory to the project main folder.
     ```
     cd <main-folder-location>
     ```

<br>

4. Create Directories
   * `logs` directory
   * `media` directory
  
  <br>

5. Backend Setup `Django`
   <ol>
   <li> Set Up a Virtual Environment</li>
    
   ```
   python -m venv venv
   ```
   
   <br>
   
   <li> Activate the Virtual Environment</li>
   
   ```
   venv\Scripts\activate
   ```
   
   <br>

   <li> Install Required Modules</li>
   
   ```
   pip install -r requirements.txt
   ```
   
   <br>
  
   <li> Create Database</li>
   
   - Open Laragon and create a new database table named `wastex_db`

   <br>
   
   <li> Apply Migrations</li>
   
   ```
   python manage.py migrate
   ```

   <br>
   
   <li> Run the Django Development Server</li>
   
   ```
   python manage.py runserver
   ```

   <br>
   </ol>

6. Frontend Setup
   1. Set Up Environment Variables
      - Obtain the `.env` file with the necessary environment variables (provided privately).
      - Place the `.env` file in the project's root directory.
  
   <br>

   2. Open Command Prompt
      * Change Directory to the root/Frontend Folder
        ```
        cd <main-folder/Frontend>
        ```

   <br>
    
   3. Install Dependencies
      ```
      npm install
      ```

   <br>
  
   4. Run the Development Server
      ```
      npm run dev
      ```

   <br>
  
   5. Open the website
      - Next.Js will state the website link

